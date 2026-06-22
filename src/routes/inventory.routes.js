const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const authorize = require("../middlewares/role.middleware");

const {
   create,
   getAll,
   stockIn,
   stockOut,
} = require("../controllers/inventory/inventory.controller");

router.post("/", protect, authorize("admin", "store_manager"), create);

router.get("/", protect, getAll);

router.put(
   "/stock-in/:id",
   protect,
   authorize("admin", "store_manager"),
   stockIn,
);

router.put(
   "/stock-out/:id",
   protect,
   authorize("admin", "store_manager"),
   stockOut,
);

module.exports = router;
