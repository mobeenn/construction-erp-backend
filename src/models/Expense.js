const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
   {
      expenseNo: {
         type: String,

         unique: true,
      },

      project: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "Project",

         required: true,
      },

      category: {
         type: String,

         enum: [
            "labour",

            "fuel",

            "equipment",

            "office",

            "transport",

            "maintenance",

            "other",
         ],

         required: true,
      },

      amount: {
         type: Number,

         required: true,
      },

      description: {
         type: String,

         required: true,
      },

      paymentMethod: {
         type: String,

         enum: ["cash", "bank", "cheque"],

         default: "cash",
      },

      expenseDate: {
         type: Date,

         default: Date.now,
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
   "Expense",

   expenseSchema,
);
