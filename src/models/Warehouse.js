const { model } = require("../config/pgDb");

module.exports = model("warehouses", {
   defaults: { status: "active" },
   refs: { project: "projects", manager: "users" },
});
