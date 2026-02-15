const { Drop, Purchase, User } = require("../models");
const { TOP_BUYERS_LIMIT } = require("../config/constants");

/**
 * Drop Repository - handles all database operations for drops
 */
class DropRepository {
  /**
   * Create a new drop
   */
  async create(dropData) {
    return await Drop.create(dropData);
  }

  /**
   * Find all drops with optional includes
   */
  async findAll(options = {}) {
    return await Drop.findAll(options);
  }

  /**
   * Find drop by ID
   */
  async findById(id, options = {}) {
    return await Drop.findByPk(id, options);
  }

  /**
   * Find drop with lock for update (used in transactions)
   */
  async findByIdWithLock(id, transaction) {
    return await Drop.findOne({
      where: { id },
      lock: transaction.LOCK.UPDATE,
      transaction,
    });
  }

  /**
   * Get all drops with top buyers
   */
  async findAllWithTopBuyers(limit = TOP_BUYERS_LIMIT) {
    return await Drop.findAll({
      include: [
        {
          model: Purchase,
          limit,
          order: [["createdAt", "DESC"]],
          include: [{ model: User, attributes: ["username"] }],
        },
      ],
    });
  }

  /**
   * Update drop stock
   */
  async updateStock(drop, newStock, transaction) {
    drop.available_stock = newStock;
    return await drop.save({ transaction });
  }

  /**
   * Decrement stock by 1
   */
  async decrementStock(drop, transaction) {
    drop.available_stock -= 1;
    return await drop.save({ transaction });
  }

  /**
   * Increment stock by 1
   */
  async incrementStock(drop, transaction) {
    drop.available_stock += 1;
    return await drop.save({ transaction });
  }
}

module.exports = new DropRepository();
