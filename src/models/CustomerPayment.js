const { model } = require("../config/jsonDb");

module.exports = model("customerPayments", {
   defaults: {
      status: "completed",
      paymentMethod: "bank",
   },
   refs: {
      client: "clients",
      project: "projects",
      contract: "contracts",
      interimPayment: "interimPayments",
      account: "accounts",
      createdBy: "users",
   },
});
