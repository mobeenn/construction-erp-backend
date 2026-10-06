const { model } = require("../config/jsonDb");

module.exports = model("vendorPayments", {
   defaults: {
      status: "completed",
      paymentMethod: "bank",
   },
   refs: {
      vendor: "vendors",
      project: "projects",
      purchaseOrder: "purchaseOrders",
      account: "accounts",
      createdBy: "users",
   },
});
