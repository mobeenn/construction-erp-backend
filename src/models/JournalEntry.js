const { model } = require("../config/jsonDb");

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
