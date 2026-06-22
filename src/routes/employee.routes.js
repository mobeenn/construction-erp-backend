const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const authorize = require("../middlewares/role.middleware");

const {
   create,
   getAll,
   getOne,
   update,
   remove,
} = require("../controllers/employees/employee.controller");

router.post("/", protect, authorize("admin", "hr"), create);

router.get("/", protect, authorize("admin", "hr"), getAll);

router.get("/:id", protect, authorize("admin", "hr"), getOne);

router.put("/:id", protect, authorize("admin", "hr"), update);

router.delete("/:id", protect, authorize("admin"), remove);

module.exports = router;
