const { model } = require("../config/jsonDb");

module.exports = model("dailyReports", {
   defaults: { status: "pending", manpower: [], equipment: [], activities: [], materialConsumed: [], materialReceived: [], attachments: [] },
   refs: { project: "projects", siteSupervisor: "users", reviewedBy: "users" },
});
