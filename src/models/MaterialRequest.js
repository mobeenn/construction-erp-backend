const { model } = require("../config/pgDb");

module.exports = model("materialRequests", {
   defaults: { status: "pending" },
   refs: {
      project: "projects",
      requestedBy: "users",
      approvedBy: "users",
      issuedBy: "users",
   },
});
