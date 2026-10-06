const VendorQuotation = require("../models/VendorQuotation");
const generateQuotationNo = async () => {
   const count = await VendorQuotation.countDocuments();
   return `QT-${String(count + 1).padStart(4, "0")}`;
};
module.exports = generateQuotationNo;
