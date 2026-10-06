const { model } = require("../config/jsonDb");

module.exports = model("stockTransfers", {
   defaults: { status: "completed" },
   refs: { fromWarehouse: "warehouses", toWarehouse: "warehouses", inventory: "inventory", project: "projects", createdBy: "users" },
});
