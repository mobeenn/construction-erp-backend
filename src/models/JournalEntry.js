const { model } = require("../config/pgDb");

module.exports = model("journalEntries", {
   defaults: {
      status: "posted",
      totalDebit: 0,
      totalCredit: 0,
   },
   refs: {
      project: "projects",
      createdBy: "users",
      contract: "contracts",
   },
});
