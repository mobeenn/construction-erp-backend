const { model } = require("../config/pgDb");

module.exports = model("designations", {
   defaults: { status: "active" },
   refs: { department: "departments" },
});
