const { Reservation } = require("../models");
const { Op } = require("sequelize");

/**
 * Reservation Repository - handles all database operations for reservations
 */
class ReservationRepository {
  /**
   * Create a new reservation
   */
  async create(reservationData, transaction) {
    return await Reservation.create(reservationData, { transaction });
  }

  /**
   * Find reservation by ID
   */
  async findById(id, options = {}) {
    return await Reservation.findByPk(id, options);
  }

  /**
   * Find all expired active reservations
   */
  async findExpired() {
    return await Reservation.findAll({
      where: {
        status: "active",
        expires_at: { [Op.lt]: new Date() },
      },
    });
  }

  /**
   * Update reservation status
   */
  async updateStatus(reservation, status, transaction = null) {
    reservation.status = status;
    return await reservation.save({ transaction });
  }
}

module.exports = new ReservationRepository();
