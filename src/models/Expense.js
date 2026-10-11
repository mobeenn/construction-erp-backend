const { model } = require("../config/pgDb");

module.exports = model("expenses", {
   defaults: {
      paymentMethod: "cash",
      expenseDate: () => new Date().toISOString(),
   },
   refs: { project: "projects", createdBy: "users" },
});
