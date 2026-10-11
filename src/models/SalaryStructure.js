const { model } = require("../config/pgDb");

module.exports = model("salaryStructures", {
   defaults: { allowances: [], deductions: [], overtimeRate: 0, currency: "PKR", status: "active" },
   refs: { employee: "employees", createdBy: "users" },
});
