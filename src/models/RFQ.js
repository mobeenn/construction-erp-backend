const { model } = require("../config/pgDb");

module.exports = model("rfqs", {
   defaults: { status: "open", items: [] },
   refs: { project: "projects", createdBy: "users" },
});
