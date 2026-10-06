const { model } = require("../config/jsonDb");

module.exports = model("permissionPolicies", { defaults: {}, refs: { updatedBy: "users" } });
