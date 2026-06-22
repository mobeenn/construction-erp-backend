const {
   attendanceReport,

   expenseReport,

   inventoryReport,

   projectReport,
} = require("../../services/report.service");

// Attendance

exports.attendance = async (
   req,

   res,
) => {
   const data = await attendanceReport();

   res.status(200).json({
      success: true,

      data,
   });
};

// Expense

exports.expenses = async (
   req,

   res,
) => {
   const data = await expenseReport();

   res.status(200).json({
      success: true,

      data,
   });
};

// Inventory

exports.inventory = async (
   req,

   res,
) => {
   const data = await inventoryReport();

   res.status(200).json({
      success: true,

      data,
   });
};

// Projects

exports.projects = async (
   req,

   res,
) => {
   const data = await projectReport();

   res.status(200).json({
      success: true,

      data,
   });
};
