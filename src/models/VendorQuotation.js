const { model } = require("../config/pgDb");

module.exports = model("vendorQuotations", {
   defaults: { status: "received" },
   refs: { vendor: "vendors", rfq: "rfqs" },
});
