const Attendance = require("../models/Attendance");

const Expense = require("../models/Expense");

const Inventory = require("../models/Inventory");

const Project = require("../models/Project");

// Attendance

exports.attendanceReport = async () => {
   return await Attendance.find()

      .populate(
         "employee",

         "name",
      );
};

// Expense

exports.expenseReport = async () => {
   return await Expense.find()

      .populate(
         "project",

         "name",
      );
};

// Inventory

exports.inventoryReport = async () => {
   return await Inventory.find()

      .populate(
         "project",

         "name",
      );
};

// Projects

exports.projectReport = async () => {
   return await Project.find();
};
