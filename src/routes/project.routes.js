const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const authorize = require("../middlewares/role.middleware");

const {
   create,
   getAll,
   update,
   remove,
   updateRevenue,
} = require("../controllers/projects/project.controller");

router.post("/", protect, authorize("admin"), create);

router.get("/", protect, getAll);

router.put("/:id", protect, authorize("admin"), update);

router.delete("/:id", protect, authorize("admin"), remove);

router.put("/revenue/:id", protect, authorize("admin"), updateRevenue);

module.exports = router;
