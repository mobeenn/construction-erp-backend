const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const {
   create,
   getAll,
   stockIn,
   stockOut,
   transfer,
   returnMaterial,
   adjust,
   reviewAdjustment,
   transfers,
   adjustments,
   returns,
   ledger,
   movements,
   valuation,
   lowStock,
   consumption,
} = require("../controllers/inventory/inventory.controller");
router.post("/", protect, authorize("admin", "store_manager"), create);
router.get("/", protect, getAll);
router.put("/stock-in/:id", protect, authorize("admin", "store_manager"), stockIn);
router.put("/stock-out/:id", protect, authorize("admin", "store_manager"), stockOut);
router.post("/transfer", protect, authorize("admin", "store_manager"), transfer);
router.post("/return", protect, authorize("admin", "store_manager", "site_supervisor"), returnMaterial);
router.post("/adjust", protect, authorize("admin", "store_manager"), adjust);
router.put("/adjustments/:id/review", protect, authorize("admin"), reviewAdjustment);
router.get("/transfers", protect, transfers);
router.get("/adjustments", protect, adjustments);
router.get("/returns", protect, returns);
router.get("/ledger", protect, ledger);
router.get("/movements", protect, movements);
router.get("/valuation", protect, valuation);
router.get("/low-stock", protect, lowStock);
router.get("/consumption", protect, consumption);
module.exports = router;
