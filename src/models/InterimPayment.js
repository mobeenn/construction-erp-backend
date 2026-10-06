const { model } = require("../config/jsonDb");

module.exports = model("interimPayments", {
   defaults: {
      status: "draft",
      retention: 0,
      advanceRecovery: 0,
      tax: 0,
      otherDeductions: 0,
      previousCertifiedAmount: 0,
      workCompletedAmount: 0,
      currentGrossAmount: 0,
      approvedAmount: 0,
      paidAmount: 0,
      outstandingAmount: 0,
      payments: [],
   },
   refs: {
      project: "projects",
      contract: "contracts",
      client: "clients",
      submittedBy: "users",
      approvedBy: "users",
   },
});
