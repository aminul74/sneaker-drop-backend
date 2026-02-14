const dropService = require("../services/dropService");

/**
 * Create a new drop
 */
exports.createDrop = async (req, res, next) => {
  try {
    const drop = await dropService.createDrop(req.body);
    res.json(drop);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all drops with top 3 recent buyers
 */
exports.getDrops = async (req, res, next) => {
  try {
    const drops = await dropService.getAllDropsWithBuyers();
    res.json(drops);
  } catch (error) {
    next(error);
  }
};

/**
 * Reserve an item
 */
exports.reserveItem = async (req, res, next) => {
  try {
    const { dropId, userId } = req.body;
    const reservation = await dropService.reserveItem(dropId, userId);
    res.json(reservation);
  } catch (error) {
    next(error);
  }
};

/**
 * Complete a purchase from an active reservation
 */
exports.completePurchase = async (req, res, next) => {
  try {
    const { reservationId } = req.body;
    const result = await dropService.completePurchase(reservationId);
    res.json({ message: "Purchase successful", purchase: result.purchase });
  } catch (error) {
    next(error);
  }
};
