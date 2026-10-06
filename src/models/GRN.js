const { model } = require("../config/jsonDb");

module.exports = model("grns", {
   defaults: {},
   refs: {
      purchaseOrder: "purchaseOrders",
      vendor: "vendors",
      project: "projects",
      receivedBy: "users",
   },
});
