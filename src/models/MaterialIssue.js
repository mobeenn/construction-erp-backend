const { model } = require("../config/jsonDb");

module.exports = model("materialIssues", {
   defaults: {},
   refs: {
      request: "materialRequests",
      project: "projects",
      issuedBy: "users",
      employee: "employees",
      activity: "activities",
   },
});

