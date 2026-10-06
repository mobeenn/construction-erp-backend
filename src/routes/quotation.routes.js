const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const c = require("../controllers/quotations/quotation.controller");

router.get("/", protect, c.getAll);
router.post("/", protect, authorize("admin", "purchase_manager", "site_supervisor"), c.create);
router.put("/:id/select", protect, authorize("admin", "purchase_manager"), c.select);
router.get("/compare/:rfqId", protect, c.compare);

module.exports = router;
