const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const controller = require("../controllers/permissions/permissions.controller");

router.get("/", protect, controller.getPolicies);
router.put("/", protect, authorize("admin"), controller.updatePolicies);

module.exports = router;
