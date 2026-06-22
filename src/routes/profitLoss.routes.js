const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const authorize = require("../middlewares/role.middleware");

const {
   getReport,
} = require("../controllers/profitLoss/profitLoss.controller");

router.get("/", protect, authorize("admin"), getReport);

module.exports = router;
