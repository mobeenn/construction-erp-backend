const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const authorize = require("../middlewares/role.middleware");

const { create, getAll } = require("../controllers/grn/grn.controller");

router.post("/", protect, authorize("admin", "store_manager"), create);
router.get("/", protect, authorize("admin", "store_manager"), getAll);

module.exports = router;
