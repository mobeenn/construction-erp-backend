const { model } = require("../config/jsonDb");

module.exports = model("vendors", {
   defaults: { status: "active" },
   refs: {},
});
