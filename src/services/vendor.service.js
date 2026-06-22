const Vendor = require("../models/Vendor");

const generateVendorCode = require("../utils/generateVendorCode");

exports.createVendor = async (data) => {
   const vendorCode = await generateVendorCode();

   return await Vendor.create({
      ...data,

      vendorCode,
   });
};
