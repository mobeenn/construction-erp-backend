const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const authorize = require("../middlewares/role.middleware");

const { dashboard } = require("../controllers/dashboard/dashboard.controller");

router.get("/", protect, authorize("admin"), dashboard);

module.exports = router;
