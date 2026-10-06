const { model } = require("../config/jsonDb");

module.exports = model("inventory", {
   defaults: { currentStock: 0, minimumStock: 100, openingQuantity: 0, receivedQuantity: 0, issuedQuantity: 0, transferredQuantity: 0, reorderLevel: 0 },
   refs: { project: "projects", warehouse: "warehouses" },
});
