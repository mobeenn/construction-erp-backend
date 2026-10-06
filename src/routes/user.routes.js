const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const authorize = require("../middlewares/role.middleware");

const {
   getUsers,
   updateUser,
   deleteUser,
   userStats,
} = require("../controllers/users/user.controller");

router.get("/", protect, authorize("admin", "hr"), getUsers);

router.put("/:id", protect, authorize("admin"), updateUser);

router.delete("/:id", protect, authorize("admin"), deleteUser);

router.get("/stats", protect, authorize("admin"), userStats);

module.exports = router;
