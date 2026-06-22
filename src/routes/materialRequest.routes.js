const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const authorize = require("../middlewares/role.middleware");

const {
   create,
   getAll,
   approve,
   reject,
} = require("../controllers/materialRequests/materialRequest.controller");

// Create

router.post("/", protect, authorize("admin", "site_supervisor"), create);

// Get All

router.get("/", protect, getAll);

// Approve

router.put(
   "/approve/:id",
   protect,
   authorize("admin", "purchase_manager"),
   approve,
);

// Reject

router.put(
   "/reject/:id",
   protect,
   authorize("admin", "purchase_manager"),
   reject,
);

module.exports = router;
