const { model } = require("../config/pgDb");

module.exports = model("journalEntryLines", {
   defaults: {
      debit: 0,
      credit: 0,
   },
   refs: {
      journalEntry: "journalEntries",
      account: "accounts",
      project: "projects",
   },
});
