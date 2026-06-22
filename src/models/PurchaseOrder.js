const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
   {
      poNumber: {
         type: String,

         unique: true,
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

      createdBy: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "User",
      },

      items: [
         {
            materialName: String,

            quantity: Number,

            unitPrice: Number,

            total: Number,
         },
      ],

      grandTotal: {
         type: Number,

         default: 0,
      },

      status: {
         type: String,

         enum: ["draft", "approved", "delivered", "cancelled"],

         default: "draft",
      },
   },
   {
      timestamps: true,
   },
);

module.exports = mongoose.model(
   "PurchaseOrder",

   purchaseOrderSchema,
);
