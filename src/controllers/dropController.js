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
      { transaction }
    );

    await transaction.commit();

    global.io.emit("stock_update", {
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

  const reservation = await Reservation.findByPk(reservationId);

  if (!reservation || reservation.status !== "active") {
    return res.status(400).json({ message: "Invalid reservation" });
  }

  reservation.status = "completed";
  await reservation.save();

  await Purchase.create({
    UserId: reservation.UserId,
    DropId: reservation.DropId,
  });

  res.json({ message: "Purchase successful" });
};
