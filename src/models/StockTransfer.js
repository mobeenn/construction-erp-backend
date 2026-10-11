const { model } = require("../config/pgDb");

module.exports = model("stockTransfers", {
   defaults: { status: "completed" },
   refs: { fromWarehouse: "warehouses", toWarehouse: "warehouses", inventory: "inventory", project: "projects", createdBy: "users" },
});
