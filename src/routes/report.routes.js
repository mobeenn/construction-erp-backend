const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const authorize = require("../middlewares/role.middleware");

const {
   attendance,

   expenses,

   inventory,

   projects,
} = require("../controllers/reports/report.controller");

router.get("/attendance", protect, authorize("admin"), attendance);

router.get("/expenses", protect, authorize("admin"), expenses);

router.get("/inventory", protect, authorize("admin"), inventory);

router.get("/projects", protect, authorize("admin"), projects);

module.exports = router;
