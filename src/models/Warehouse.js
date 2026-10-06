const { model } = require("../config/jsonDb");

module.exports = model("warehouses", {
   defaults: { status: "active" },
   refs: { project: "projects", manager: "users" },
});
