const { model } = require("../config/pgDb");

module.exports = model("users", {
   defaults: { role: "site_supervisor", isActive: true },
   refs: {},
});
