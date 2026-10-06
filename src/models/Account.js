const { model } = require("../config/jsonDb");

module.exports = model("accounts", {
   defaults: {
      isActive: true,
      openingBalance: 0,
      currentBalance: 0,
   },
   refs: {
      category: "accountCategories",
      project: "projects",
   },
});
