const { model } = require("../config/pgDb");

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

