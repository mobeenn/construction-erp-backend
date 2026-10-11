const { model } = require("../config/pgDb");

module.exports = model("clients", {
   defaults: { status: "active", taxInformation: "", paymentTerms: "", notes: "" },
   refs: {},
});
