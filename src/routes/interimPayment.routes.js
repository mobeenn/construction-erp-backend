const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const c = require("../controllers/interimPayments/interimPayment.controller");

router.get("/", protect, c.getAll);
router.get("/financial/:projectId", protect, c.financialSummary);
router.get("/:id", protect, c.getOne);
router.post(
   "/",
   protect,
   authorize("admin", "accountant", "site_supervisor"),
   c.create,
);
router.put(
   "/:id/status",
   protect,
   authorize("admin", "accountant", "site_supervisor"),
   c.updateStatus,
);
router.put(
   "/:id/pay",
   protect,
   authorize("admin", "accountant"),
   c.recordPayment,
);
router.delete("/:id", protect, authorize("admin"), c.remove);

module.exports = router;
