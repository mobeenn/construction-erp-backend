const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const c = require("../controllers/progressUpdates/progressUpdate.controller");

router.get("/", protect, c.getAll);
router.post("/", protect, authorize("admin", "site_supervisor"), c.create);
router.put("/:id/approve", protect, authorize("admin"), c.approve);
router.put("/:id/reject", protect, authorize("admin"), c.reject);

module.exports = router;
