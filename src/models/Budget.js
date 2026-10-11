const { model } = require("../config/pgDb");

module.exports = model("budgets", {
   defaults: { status: "draft", version: 1, lines: [] },
   refs: { project: "projects", approvedBy: "users" },
});
