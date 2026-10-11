const { model } = require("../config/pgDb");

module.exports = model("grns", {
   defaults: {},
   refs: {
      purchaseOrder: "purchaseOrders",
      vendor: "vendors",
      project: "projects",
      receivedBy: "users",
   },
});
