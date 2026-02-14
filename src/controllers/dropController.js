const { sequelize, Drop, Reservation, Purchase, User } = require("../models");
const { Op } = require("sequelize");

// CREATE DROP
exports.createDrop = async (req, res) => {
  try {
    const { name, price, total_stock, start_time } = req.body;

    const drop = await Drop.create({
      name,
      price,
      total_stock,
      available_stock: total_stock,
      start_time,
    });

    res.json(drop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL DROPS WITH TOP 3 BUYERS
exports.getDrops = async (req, res) => {
  const drops = await Drop.findAll({
    include: [
      {
        model: Purchase,
        limit: 3,
        order: [["createdAt", "DESC"]],
        include: [{ model: User, attributes: ["username"] }],
      },
    ],
  });

  res.json(drops);
};

// RESERVE (ATOMIC)
exports.reserveItem = async (req, res) => {
  const { dropId, userId } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const drop = await Drop.findOne({
      where: { id: dropId },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    if (!drop || drop.available_stock <= 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "Out of stock" });
    }

    drop.available_stock -= 1;
    await drop.save({ transaction });

    const reservation = await Reservation.create(
      {
        UserId: userId,
        DropId: dropId,
        expires_at: new Date(Date.now() + 60000),
      },
      { transaction },
    );

    await transaction.commit();

    // Emit stock update to all connected clients
    global.io.to("drops").emit("stock_update", {
      dropId,
      available_stock: drop.available_stock,
    });

    res.json(reservation);
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ error: err.message });
  }
};

// COMPLETE PURCHASE
exports.completePurchase = async (req, res) => {
  const { reservationId } = req.body;

  const reservation = await Reservation.findByPk(reservationId, {
    include: ["Drop"],
  });

  if (!reservation || reservation.status !== "active") {
    return res.status(410).json({ error: "Reservation expired or invalid" });
  }

  if (new Date() > new Date(reservation.expires_at)) {
    reservation.status = "expired";
    await reservation.save();
    return res.status(410).json({ error: "Reservation expired" });
  }

  reservation.status = "completed";
  await reservation.save();

  const purchase = await Purchase.create({
    UserId: reservation.UserId,
    DropId: reservation.DropId,
  });

  // Emit purchase update to all clients
  global.io.to("drops").emit("purchase_complete", {
    dropId: reservation.DropId,
    userId: reservation.UserId,
    purchaseId: purchase.id,
  });

  res.json({ message: "Purchase successful", purchase });
};
