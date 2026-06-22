const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
   {
      employee: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "Employee",

         required: true,
      },

      date: {
         type: Date,

         required: true,
      },

      status: {
         type: String,

         enum: ["present", "absent", "half_day"],

         required: true,
      },

      overtimeHours: {
         type: Number,

         default: 0,
      },

      markedBy: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "User",
      },
      project: {
         type: mongoose.Schema.Types.ObjectId,

         ref: "Project",

         required: true,
      },
   },
   {
      timestamps: true,
   },
);

// Duplicate attendance prevent

attendanceSchema.index(
   {
      employee: 1,

      date: 1,
   },
   {
      unique: true,
   },
);

module.exports = mongoose.model(
   "Attendance",

   attendanceSchema,
);
