const { model } = require("../config/pgDb");

module.exports = model("cashAccounts", {
   defaults: {
      balance: 0,
      isActive: true,
   },
   refs: {
      project: "projects",
      createdBy: "users",
   },
});
