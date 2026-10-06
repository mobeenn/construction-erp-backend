const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const authorize = require("../middlewares/role.middleware");

const { dashboard } = require("../controllers/dashboard/dashboard.controller");
const { analytics } = require("../controllers/dashboard/analytics.controller");

router.get("/", protect, authorize("admin"), dashboard);
// Analytics is read-only aggregate data used by every role's dashboard.
router.get("/analytics", protect, analytics);

module.exports = router;
