const { model } = require("../config/pgDb");

module.exports = model("departments", {
   defaults: { status: "active" },
   refs: { head: "users" },
});
