const { model } = require("../config/pgDb");

module.exports = model("progressUpdates", {
   defaults: { status: "pending" },
   refs: { project: "projects", activity: "activities", updatedBy: "users", approvedBy: "users" },
});
