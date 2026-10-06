const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const c = require("../controllers/warehouses/warehouse.controller");

router.get("/", protect, c.getAll);
router.post("/", protect, authorize("admin", "store_manager"), c.create);
router.put("/:id", protect, authorize("admin", "store_manager"), c.update);
router.delete("/:id", protect, authorize("admin"), c.remove);

module.exports = router;
