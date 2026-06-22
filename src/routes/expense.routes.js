const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const authorize = require("../middlewares/role.middleware");

const {
   create,

   getAll,
} = require("../controllers/expenses/expense.controller");

router.post("/", protect, authorize("admin", "accountant"), create);

router.get("/", protect, getAll);

module.exports = router;
