const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const authorize = require("../middlewares/role.middleware");

const {
   issue,
   getAll,
} = require("../controllers/materialIssues/materialIssue.controller");

router.post("/", protect, authorize("admin", "store_manager"), issue);
router.get("/", protect, authorize("admin", "store_manager"), getAll);

module.exports = router;
