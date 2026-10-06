const { model } = require("../config/jsonDb");

module.exports = model("documents", {
   defaults: {
      entityType: "project",
      fileType: "",
      size: 0,
      description: "",
      isActive: true,
   },
   refs: {
      project: "projects",
      contract: "contracts",
      client: "clients",
      purchaseOrder: "purchaseOrders",
      grn: "grns",
      vendor: "vendors",
      interimPayment: "interimPayments",
      expense: "expenses",
      employee: "employees",
      dailyReport: "dailyReports",
      uploadedBy: "users",
   },
});
