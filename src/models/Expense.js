const { model } = require("../config/jsonDb");

module.exports = model("expenses", {
   defaults: {
      paymentMethod: "cash",
      expenseDate: () => new Date().toISOString(),
   },
   refs: { project: "projects", createdBy: "users" },
});
