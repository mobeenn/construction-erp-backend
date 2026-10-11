const { model } = require("../config/pgDb");

module.exports = model("accountCategories", {
   defaults: {
      type: "asset",
      isActive: true,
   },
   refs: {},
});
