const Attendance = require("../../models/Attendance");

const { attendanceSchema } = require("../../validators/attendance.validation");

const { markAttendance } = require("../../services/attendance.service");

// Mark Attendance

exports.create = async (req, res) => {
   try {
      const data = attendanceSchema.parse(req.body);

      const attendance = await markAttendance(
         data,

         req.user._id,
      );

      res.status(201).json({
         success: true,

         data: attendance,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Get Daily Attendance

exports.dailyAttendance = async (
   req,

   res,
) => {
   try {
      const date = req.query.date;

      const attendance = await Attendance.find({
         date,
      })

         .populate(
            "employee",

            "employeeId name designation",
         );

      res.status(200).json({
         success: true,

         data: attendance,
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};

// Monthly Summary

exports.monthlySummary = async (
   req,

   res,
) => {
   try {
      const employeeId = req.params.id;

      const month = Number(req.query.month);

      const year = Number(req.query.year);

      const start = new Date(
         year,

         month - 1,

         1,
      );

      const end = new Date(
         year,

         month,

         0,
      );

      const data = await Attendance.find({
         employee: employeeId,

         date: {
            $gte: start,

            $lte: end,
         },
      });

      let present = 0;

      let absent = 0;

      let halfDay = 0;

      let overtime = 0;

      data.forEach((item) => {
         if (item.status === "present") present++;

         if (item.status === "absent") absent++;

         if (item.status === "half_day") halfDay++;

         overtime += item.overtimeHours;
      });

      res.status(200).json({
         success: true,

         data: {
            present,

            absent,

            halfDay,

            overtime,
         },
      });
   } catch (error) {
      res.status(500).json({
         success: false,

         message: error.message,
      });
   }
};
