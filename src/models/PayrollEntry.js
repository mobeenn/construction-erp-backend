const { model } = require("../config/pgDb");

module.exports = model("payrollEntries", {
   defaults: { allowances: [], deductions: [], overtimeHours: 0, status: "draft" },
   refs: { period: "payrollPeriods", employee: "employees", salaryStructure: "salaryStructures" },
});
