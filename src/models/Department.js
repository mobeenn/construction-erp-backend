const { model } = require("../config/jsonDb");

module.exports = model("departments", {
   defaults: { status: "active" },
   refs: { head: "users" },
});
