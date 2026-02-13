const { Reservation, Drop } = require("../models");
const { Op } = require("sequelize");

function startExpirationJob() {
  setInterval(async () => {
    const expiredReservations = await Reservation.findAll({
      where: {
        status: "active",
        expires_at: { [Op.lt]: new Date() },
      },
    });

    for (let reservation of expiredReservations) {
      const drop = await Drop.findByPk(reservation.DropId);

      drop.available_stock += 1;
      await drop.save();

      reservation.status = "expired";
      await reservation.save();

      global.io.emit("stock_update", {
        dropId: drop.id,
        available_stock: drop.available_stock,
      });
    }
  }, 5000);
}

module.exports = startExpirationJob;
