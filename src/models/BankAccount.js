const { model } = require("../config/pgDb");

module.exports = model("bankAccounts", {
   defaults: {
      balance: 0,
      isActive: true,
   },
   refs: {
      project: "projects",
      createdBy: "users",
   },
});
