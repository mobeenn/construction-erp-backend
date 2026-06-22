const mongoose = require("mongoose");

const materialIssueSchema = new mongoose.Schema(
   {
      issueNo: {
         type: String,

         unique: true,
      },

      request: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "MaterialRequest",

         required: true,
      },

      project: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "Project",

         required: true,
      },

      issuedBy: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "User",
      },

      items: [
         {
            inventory: {
               type: mongoose.Schema.Types.ObjectId,

               ref: "Inventory",
            },

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
   "MaterialIssue",

   materialIssueSchema,
);
