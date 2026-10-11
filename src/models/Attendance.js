const { model } = require("../config/pgDb");

module.exports = model("attendance", {
   defaults: { overtimeHours: 0 },
   refs: { employee: "employees", markedBy: "users", project: "projects" },
});
