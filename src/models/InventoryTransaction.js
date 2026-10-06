const { model } = require("../config/jsonDb");

module.exports = model("inventoryTransactions", {
   defaults: {},
   refs: {
      inventory: "inventory",
      project: "projects",
      warehouse: "warehouses",
      createdBy: "users",
   },
});

