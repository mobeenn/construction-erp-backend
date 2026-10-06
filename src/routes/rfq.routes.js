const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const c = require("../controllers/rfqs/rfq.controller");

router.get("/", protect, c.getAll);
router.get("/:id", protect, c.getOne);
router.post("/", protect, authorize("admin", "purchase_manager"), c.create);

module.exports = router;
