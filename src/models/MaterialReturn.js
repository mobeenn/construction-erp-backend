const { model } = require("../config/pgDb");

module.exports = model("materialReturns", {
   defaults: {},
   refs: { inventory: "inventory", project: "projects", createdBy: "users" },
});
