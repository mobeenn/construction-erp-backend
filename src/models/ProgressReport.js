const { model } = require("../config/jsonDb");

module.exports = model("progressReports", {
   defaults: {},
   refs: { project: "projects", reportedBy: "users" },
});
