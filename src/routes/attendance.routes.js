const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const authorize = require("../middlewares/role.middleware");

const {
   create,
   dailyAttendance,
   monthlySummary,
} = require("../controllers/attendance/attendance.controller");

router.post("/", protect, authorize("admin", "hr", "site_supervisor"), create);

router.get("/daily", protect, dailyAttendance);

router.get("/monthly/:id", protect, monthlySummary);

module.exports = router;
