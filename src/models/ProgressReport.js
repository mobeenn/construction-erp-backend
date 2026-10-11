const { model } = require("../config/pgDb");

module.exports = model("progressReports", {
   defaults: {},
   refs: { project: "projects", reportedBy: "users" },
});
