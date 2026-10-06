const { model } = require("../config/jsonDb");

module.exports = model("designations", {
   defaults: { status: "active" },
   refs: { department: "departments" },
});
