const { Purchase } = require("../models");

/**
 * Purchase Repository - handles all database operations for purchases
 */
class PurchaseRepository {
  /**
   * Create a new purchase
   */
  async create(purchaseData) {
    return await Purchase.create(purchaseData);
  }

  /**
   * Find purchase by ID
   */
  async findById(id, options = {}) {
    return await Purchase.findByPk(id, options);
  }
}

module.exports = new PurchaseRepository();
