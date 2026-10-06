const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const c = require("../controllers/budgets/budget.controller");

router.get("/", protect, c.getAll);
router.post("/", protect, authorize("admin", "accountant"), c.create);
router.put("/:id/activate", protect, authorize("admin", "accountant"), c.activate);
router.delete("/:id", protect, authorize("admin"), c.remove);
router.get("/analysis/:projectId", protect, c.analysis);

module.exports = router;
