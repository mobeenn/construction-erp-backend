const { model } = require("../config/jsonDb");

module.exports = model("materialRequests", {
   defaults: { status: "pending" },
   refs: {
      project: "projects",
      requestedBy: "users",
      approvedBy: "users",
      issuedBy: "users",
   },
});
