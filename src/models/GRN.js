const mongoose = require("mongoose");

const grnSchema = new mongoose.Schema(
   {
      grnNo: {
         type: String,

         unique: true,
      },

      purchaseOrder: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "PurchaseOrder",

         required: true,
      },

      vendor: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "Vendor",

         required: true,
      },

      project: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "Project",

         required: true,
      },

      receivedBy: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "User",
      },

      items: [
         {
            materialName: String,

            quantity: Number,
         },
      ],

      remarks: String,
   },
   {
      timestamps: true,
   },
);

module.exports = mongoose.model(
   "GRN",

   grnSchema,
);
