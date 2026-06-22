const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
   {
      project: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "Project",

         required: true,
      },

      materialName: {
         type: String,

         required: true,
      },

      category: {
         type: String,

         required: true,
      },

      unit: {
         type: String,

         enum: ["bags", "tons", "pieces", "kg", "liters"],

         required: true,
      },

      currentStock: {
         type: Number,

         default: 0,
      },

      minimumStock: {
         type: Number,

         default: 100,
      },

      unitPrice: {
         type: Number,

         required: true,
      },
   },
   {
      timestamps: true,
   },
);

module.exports = mongoose.model(
   "Inventory",

   inventorySchema,
);
