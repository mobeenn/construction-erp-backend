const { model } = require("../config/jsonDb");

module.exports = model("vendorQuotations", {
   defaults: { status: "received" },
   refs: { vendor: "vendors", rfq: "rfqs" },
});
