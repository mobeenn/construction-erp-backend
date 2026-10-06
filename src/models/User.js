const { model } = require("../config/jsonDb");

module.exports = model("users", {
   defaults: { role: "site_supervisor", isActive: true },
   refs: {},
});
