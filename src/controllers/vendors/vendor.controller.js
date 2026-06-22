const Vendor = require("../../models/Vendor");

const { vendorSchema } = require("../../validators/vendor.validation");

const { createVendor } = require("../../services/vendor.service");

// Create Vendor

exports.create = async (req, res) => {
   try {
      const data = vendorSchema.parse(req.body);

      const vendor = await createVendor(data);

      res.status(201).json({
         success: true,

         data: vendor,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Get Vendors

exports.getAll = async (req, res) => {
   try {
      const vendors = await Vendor.find()

         .sort({
            createdAt: -1,
         });

      res.status(200).json({
         success: true,

         data: vendors,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};
