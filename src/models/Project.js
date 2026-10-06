const { model } = require("../config/jsonDb");

module.exports = model("projects", {
   defaults: {
      status: "planning",
      priority: "medium",
      progress: 0,
      contractValue: 0,
      budget: 0,
      receivedAmount: 0,
      engineers: [],
      employees: [],
      contractors: [],
   },
   refs: {
      supervisor: "users",
      client: "clients",
      contract: "contracts",
      projectManager: "users",
      siteSupervisor: "users",
   },
});
