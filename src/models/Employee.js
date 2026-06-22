const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
   {
      employeeId: {
         type: String,

         unique: true,
      },

      name: {
         type: String,

         required: true,
      },

      cnic: {
         type: String,

         required: true,

         unique: true,
      },

      phone: {
         type: String,

         required: true,
      },

      email: {
         type: String,

         default: null,
      },

      designation: {
         type: String,

         required: true,
      },

      salary: {
         type: Number,

         required: true,
      },

      assignedSite: {
         type: String,

         required: true,
      },

      joiningDate: {
         type: Date,

         default: Date.now,
      },

      status: {
         type: String,

         enum: ["active", "inactive"],

         default: "active",
      },

      leaveBalance: {
         type: Number,

         default: 12,
      },

      performanceNotes: [
         {
            note: String,

            createdAt: {
               type: Date,

               default: Date.now,
            },
         },
      ],
      assignedProject: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "Project",
         required: true,
      },
   },
   {
      timestamps: true,
   },
);

module.exports = mongoose.model("Employee", employeeSchema);
