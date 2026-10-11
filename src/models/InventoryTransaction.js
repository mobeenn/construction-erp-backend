const { model } = require("../config/pgDb");

module.exports = model("inventoryTransactions", {
   defaults: {},
   refs: {
      inventory: "inventory",
      project: "projects",
      warehouse: "warehouses",
      createdBy: "users",
   },
});

