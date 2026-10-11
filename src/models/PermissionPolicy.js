const { model } = require("../config/pgDb");

module.exports = model("permissionPolicies", { defaults: {}, refs: { updatedBy: "users" } });
