const Vendor = require("../models/Vendor");

const generateVendorCode = async () => {
   const count = await Vendor.countDocuments();

   return `VND-${String(count + 1).padStart(4, "0")}`;
};

module.exports = generateVendorCode;
