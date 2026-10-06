const { model } = require("../config/jsonDb");

module.exports = model("attendance", {
   defaults: { overtimeHours: 0 },
   refs: { employee: "employees", markedBy: "users", project: "projects" },
});
