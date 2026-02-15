const dropService = require("../services/drop.services");
const CreateDropDTO = require("../dtos/create-drop.dto");
const ReserveItemDTO = require("../dtos/reserve-item.dto");
const CompletePurchaseDTO = require("../dtos/complete-purchase.dto");
const DropResponseDTO = require("../dtos/drop-response.dto");
const ReservationResponseDTO = require("../dtos/reservation-response.dto");
const PurchaseResponseDTO = require("../dtos/purchase-response.dto");

/**
 * Create a new drop
 */
exports.createDrop = async (req, res, next) => {
  try {
    const createDropDTO = new CreateDropDTO(req.body);
    const drop = await dropService.createDrop(createDropDTO);
    res.json(new DropResponseDTO(drop));
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
    res.json(drops.map((drop) => new DropResponseDTO(drop)));
  } catch (error) {
    next(error);
  }
};

/**
 * Reserve an item
 */
exports.reserveItem = async (req, res, next) => {
  try {
    const reserveItemDTO = new ReserveItemDTO(req.body);
    const reservation = await dropService.reserveItem(
      reserveItemDTO.dropId,
      reserveItemDTO.userId,
    );
    res.json(new ReservationResponseDTO(reservation));
  } catch (error) {
    next(error);
  }
};

/**
 * Complete a purchase from an active reservation
 */
exports.completePurchase = async (req, res, next) => {
  try {
    const completePurchaseDTO = new CompletePurchaseDTO(req.body);
    const result = await dropService.completePurchase(
      completePurchaseDTO.reservationId,
    );
    res.json({
      message: "Purchase successful",
      purchase: new PurchaseResponseDTO(result.purchase),
    });
  } catch (error) {
    next(error);
  }
};
