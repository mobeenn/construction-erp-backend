const { model } = require("../config/jsonDb");

module.exports = model("stockAdjustments", {
   defaults: { status: "pending" },
   refs: { inventory: "inventory", project: "projects", createdBy: "users", approvedBy: "users" },
});
