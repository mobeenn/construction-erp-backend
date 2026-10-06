const { model } = require("../config/jsonDb");

module.exports = model("purchaseOrders", {
   defaults: { status: "draft", grandTotal: 0 },
   refs: { vendor: "vendors", project: "projects", createdBy: "users", requestedBy: "users", approvedBy: "users" },
});
