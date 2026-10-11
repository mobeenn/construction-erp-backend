const { model } = require("../config/pgDb");

module.exports = model("dailyReports", {
   defaults: { status: "pending", manpower: [], equipment: [], activities: [], materialConsumed: [], materialReceived: [], attachments: [] },
   refs: { project: "projects", siteSupervisor: "users", reviewedBy: "users" },
});
