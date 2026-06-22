const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
   {
      projectCode: {
         type: String,

         unique: true,
      },

      name: {
         type: String,

         required: true,
      },

      location: {
         type: String,

         required: true,
      },

      description: {
         type: String,
      },

      budget: {
         type: Number,

         required: true,
      },

      startDate: {
         type: Date,

         required: true,
      },

      endDate: {
         type: Date,
      },

      supervisor: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "User",
      },

      status: {
         type: String,

         enum: ["planning", "active", "completed", "on_hold"],

         default: "planning",
      },

      progress: {
         type: Number,

         default: 0,
      },
      contractValue: {
         type: Number,
         default: 0,
      },

      receivedAmount: {
         type: Number,
         default: 0,
      },
   },
   {
      timestamps: true,
   },
);

module.exports = mongoose.model(
   "Project",

   projectSchema,
);
