const { model } = require("../config/jsonDb");

module.exports = model("materialReturns", {
   defaults: {},
   refs: { inventory: "inventory", project: "projects", createdBy: "users" },
});
