const { sequelize } = require("../models");
const dropRepository = require("../repositories/dropRepository");
const reservationRepository = require("../repositories/reservationRepository");
const purchaseRepository = require("../repositories/purchaseRepository");
const {
  RESERVATION_DURATION_MS,
  DROPS_ROOM,
  TOP_BUYERS_LIMIT,
} = require("../config/constants");

/**
 * Drop Service - handles business logic for drops
 */
class DropService {
  /**
   * Create a new drop
   */
  async createDrop(dropData) {
    const { name, price, total_stock, start_time } = dropData;

    return await dropRepository.create({
      name,
      price,
      total_stock,
      available_stock: total_stock,
      start_time,
    });
  }

  /**
   * Get all drops with top buyers
   */
  async getAllDropsWithBuyers(limit = TOP_BUYERS_LIMIT) {
    return await dropRepository.findAllWithTopBuyers(limit);
  }

  /**
   * Reserve an item (atomic operation with transaction)
   */
  async reserveItem(dropId, userId) {
    const transaction = await sequelize.transaction();

    try {
      // Lock drop row to prevent race conditions
      const drop = await dropRepository.findByIdWithLock(dropId, transaction);

      // Check stock availability
      if (!drop || drop.available_stock <= 0) {
        await transaction.rollback();
        const error = new Error("Out of stock");
        error.statusCode = 400;
        throw error;
      }

      // Decrement stock
      await dropRepository.decrementStock(drop, transaction);

      // Create reservation
      const reservation = await reservationRepository.create(
        {
          UserId: userId,
          DropId: dropId,
          expires_at: new Date(Date.now() + RESERVATION_DURATION_MS),
        },
        transaction,
      );

      await transaction.commit();

      // Broadcast stock update via WebSocket
      this.broadcastStockUpdate(dropId, drop.available_stock);

      return reservation;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Complete a purchase from an active reservation
   */
  async completePurchase(reservationId) {
    // Fetch reservation with associated drop
    const reservation = await reservationRepository.findById(reservationId, {
      include: ["Drop"],
    });

    // Validate reservation exists and is active
    if (!reservation || reservation.status !== "active") {
      const error = new Error("Reservation expired or invalid");
      error.statusCode = 410;
      throw error;
    }

    // Check expiration
    if (new Date() > new Date(reservation.expires_at)) {
      await reservationRepository.updateStatus(reservation, "expired");
      const error = new Error("Reservation expired");
      error.statusCode = 410;
      throw error;
    }

    // Mark reservation as completed
    await reservationRepository.updateStatus(reservation, "completed");

    // Create purchase record
    const purchase = await purchaseRepository.create({
      UserId: reservation.UserId,
      DropId: reservation.DropId,
    });

    // Broadcast purchase completion via WebSocket
    this.broadcastPurchaseComplete(
      reservation.DropId,
      reservation.UserId,
      purchase.id,
    );

    return { reservation, purchase };
  }

  /**
   * Expire a reservation and restore stock
   */
  async expireReservation(reservation) {
    const transaction = await sequelize.transaction();

    try {
      // Lock drop row to prevent race conditions
      const drop = await dropRepository.findByIdWithLock(
        reservation.DropId,
        transaction,
      );

      if (!drop) {
        await transaction.rollback();
        const error = new Error("Drop not found");
        error.statusCode = 404;
        throw error;
      }

      // Restore stock
      await dropRepository.incrementStock(drop, transaction);

      // Mark reservation as expired
      await reservationRepository.updateStatus(
        reservation,
        "expired",
        transaction,
      );

      await transaction.commit();

      // Broadcast stock update via WebSocket
      this.broadcastStockUpdate(
        drop.id,
        drop.available_stock,
        "reservation_expired",
      );

      return { drop, reservation };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Broadcast stock update via WebSocket
   */
  broadcastStockUpdate(dropId, availableStock, reason = null) {
    if (global.io) {
      const payload = { dropId, available_stock: availableStock };
      if (reason) payload.reason = reason;
      global.io.to(DROPS_ROOM).emit("stock_update", payload);
    }
  }

  /**
   * Broadcast purchase completion via WebSocket
   */
  broadcastPurchaseComplete(dropId, userId, purchaseId) {
    if (global.io) {
      global.io.to(DROPS_ROOM).emit("purchase_complete", {
        dropId,
        userId,
        purchaseId,
      });
    }
  }
}

module.exports = new DropService();
