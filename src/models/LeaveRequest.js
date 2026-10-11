const { model } = require("../config/pgDb");

module.exports = model("leaveRequests", {
   defaults: { status: "pending_manager", days: 0 },
   refs: {
      employee: "employees",
      project: "projects",
      managerReviewedBy: "users",
      hrReviewedBy: "users",
   },
});
