const express = require("express");
const router = express.Router();
const dropController = require("../controllers/dropController");

router.post("/create", dropController.createDrop);
router.get("/", dropController.getDrops);
router.post("/reserve", dropController.reserveItem);
router.post("/purchase", dropController.completePurchase);

module.exports = router;
