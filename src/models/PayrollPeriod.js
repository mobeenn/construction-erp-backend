const { model } = require("../config/pgDb");

module.exports = model("payrollPeriods", {
   defaults: { status: "draft", locked: false, employeeCount: 0, totals: {} },
   refs: { createdBy: "users", approvedBy: "users" },
});
