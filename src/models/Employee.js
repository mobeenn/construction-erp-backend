const { model } = require("../config/jsonDb");

module.exports = model("employees", {
   defaults: {
      status: "active",
      leaveBalance: 12,
      joiningDate: () => new Date().toISOString(),
      performanceNotes: [],
   },
   refs: {
      assignedProject: "projects",
      department: "departments",
      designationId: "designations",
      userAccount: "users",
   },
});
