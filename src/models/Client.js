const { model } = require("../config/jsonDb");

module.exports = model("clients", {
   defaults: { status: "active", taxInformation: "", paymentTerms: "", notes: "" },
   refs: {},
});
