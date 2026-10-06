const { model } = require("../config/jsonDb");

module.exports = model("rfqs", {
   defaults: { status: "open", items: [] },
   refs: { project: "projects", createdBy: "users" },
});
