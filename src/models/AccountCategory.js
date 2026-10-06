const { model } = require("../config/jsonDb");

module.exports = model("accountCategories", {
   defaults: {
      type: "asset",
      isActive: true,
   },
   refs: {},
});
