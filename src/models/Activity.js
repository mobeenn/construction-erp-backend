const { model } = require("../config/jsonDb");

module.exports = model("activities", {
   defaults: {
      status: "not_started",
      progress: 0,
      plannedPercentage: 0,
      actualPercentage: 0,
      plannedQuantity: 0,
      completedQuantity: 0,
      weight: 0,
   },
   refs: { project: "projects", assignedTo: "users", responsible: "users" },
});
