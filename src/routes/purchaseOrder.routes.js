const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const authorize = require("../middlewares/role.middleware");

const {
   create,
   getAll,
   approve,
} = require("../controllers/purchaseOrders/purchaseOrder.controller");

router.post("/", protect, authorize("admin", "purchase_manager"), create);

router.get("/", protect, getAll);

router.put("/approve/:id", protect, authorize("admin"), approve);

module.exports = router;
