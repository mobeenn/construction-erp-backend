const Attendance = require("../models/Attendance");

exports.markAttendance = async (
   data,

   userId,
) => {
   return await Attendance.create({
      ...data,

      markedBy: userId,
   });
};
