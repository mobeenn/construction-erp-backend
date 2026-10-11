const { model } = require("../config/pgDb");

module.exports = model("vendors", {
   defaults: { status: "active" },
   refs: {},
});
