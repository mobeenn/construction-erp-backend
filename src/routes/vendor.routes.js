const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const authorize = require("../middlewares/role.middleware");

const {
   create,

   getAll,
} = require("../controllers/vendors/vendor.controller");

router.post("/", protect, authorize("admin", "purchase_manager"), create);

router.get("/", protect, authorize("admin", "purchase_manager"), getAll);

module.exports = router;
