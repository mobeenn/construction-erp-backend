const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
   {
      vendorCode: {
         type: String,

         unique: true,
      },

      companyName: {
         type: String,

         required: true,
      },

      contactPerson: {
         type: String,

         required: true,
      },

      phone: {
         type: String,

         required: true,
      },

      email: {
         type: String,

         default: null,
      },

      address: {
         type: String,

         required: true,
      },

      status: {
         type: String,

         enum: ["active", "inactive"],

         default: "active",
      },
   },
   {
      timestamps: true,
   },
);

module.exports = mongoose.model(
   "Vendor",

   vendorSchema,
);
