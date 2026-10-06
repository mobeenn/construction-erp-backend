const { model } = require("../config/jsonDb");

module.exports = model("contracts", {
   defaults: {
      status: "draft",
      type: "client",
      retentionPercent: 0,
      advancePercentage: 0,
      approvedVariations: 0,
      tax: 0,
      documents: [],
   },
   refs: { client: "clients", project: "projects", vendor: "vendors" },
});
