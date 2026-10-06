const { model } = require("../config/jsonDb");

module.exports = model("notifications", {
   defaults: {
      isRead: false,
      type: "info",
   },
   refs: {
      user: "users",
      project: "projects",
      materialRequest: "materialRequests",
      purchaseOrder: "purchaseOrders",
      grn: "grns",
      interimPayment: "interimPayments",
      expense: "expenses",
      leaveRequest: "leaveRequests",
      payrollPeriod: "payrollPeriods",
      inventory: "inventory",
      dailyReport: "dailyReports",
      createdBy: "users",
   },
});
