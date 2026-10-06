const { model } = require("../config/jsonDb");

module.exports = model("progressUpdates", {
   defaults: { status: "pending" },
   refs: { project: "projects", activity: "activities", updatedBy: "users", approvedBy: "users" },
});
