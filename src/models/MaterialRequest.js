const mongoose = require("mongoose");

const materialRequestSchema = new mongoose.Schema(
   {
      requestNo: {
         type: String,

         unique: true,
      },

      project: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "Project",

         required: true,
      },

      requestedBy: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "User",
      },

      items: [
         {
            inventory: {
               type: mongoose.Schema.Types.ObjectId,

               ref: "Inventory",
            },

            quantity: {
               type: Number,

               required: true,
            },
         },
      ],

      status: {
         type: String,

         enum: ["pending", "approved", "rejected", "issued"],

         default: "pending",
      },

      remarks: {
         type: String,
      },
      approvedBy: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "User",
      },

      issuedBy: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "User",
      },

      issuedAt: Date,
   },
   {
      timestamps: true,
   },
);

module.exports = mongoose.model(
   "MaterialRequest",

   materialRequestSchema,
);
