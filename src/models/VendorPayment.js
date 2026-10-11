const { model } = require("../config/pgDb");

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
