const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema(
   {
      inventory: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "Inventory",
      },

      project: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "Project",
      },

      type: {
         type: String,

         enum: ["stock_in", "stock_out"],
      },

      quantity: {
         type: Number,

         required: true,
      },

      remarks: {
         type: String,
      },

      createdBy: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "User",
      },
   },
   {
      timestamps: true,
   },
);

module.exports = mongoose.model(
   "InventoryTransaction",

   inventoryTransactionSchema,
);
