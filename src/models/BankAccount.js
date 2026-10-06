const { model } = require("../config/jsonDb");

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
