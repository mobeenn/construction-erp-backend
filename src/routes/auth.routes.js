const express = require("express");

const router = express.Router();

const {
   register,
   login,
   me,
   createUser,
} = require("../controllers/auth/auth.controller");
const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

router.post("/register", register);

router.post("/login", login);
// Protected

router.get("/me", protect, me);

router.post("/create-user", protect, authorize("admin"), createUser);

module.exports = router;
