const Employee = require("../models/Employee");

const Attendance = require("../models/Attendance");

const Project = require("../models/Project");

const Inventory = require("../models/Inventory");

const Expense = require("../models/Expense");

const MaterialRequest = require("../models/MaterialRequest");

const PurchaseOrder = require("../models/PurchaseOrder");

exports.getDashboard = async () => {
   const today = new Date();

   today.setHours(0, 0, 0, 0);

   // Employees

   const totalEmployees = await Employee.countDocuments();

   // Attendance

   const presentToday = await Attendance.countDocuments({
      date: {
         $gte: today,
      },

      status: "present",
   });

   // Projects

   const activeProjects = await Project.countDocuments({
      status: "active",
   });

   // Inventory Value

   const inventory = await Inventory.find();

   const inventoryValue = inventory.reduce((sum, item) => {
      return sum + item.currentStock * item.unitPrice;
   }, 0);

   // Monthly Expense

   const firstDay = new Date(
      today.getFullYear(),

      today.getMonth(),

      1,
   );

   const monthlyExpenses = await Expense.aggregate([
      {
         $match: {
            expenseDate: {
               $gte: firstDay,
            },
         },
      },

      {
         $group: {
            _id: null,

            total: {
               $sum: "$amount",
            },
         },
      },
   ]);

   // Pending Material Requests

   const pendingRequests = await MaterialRequest.countDocuments({
      status: "pending",
   });

   // Pending Purchase Orders

   const pendingPO = await PurchaseOrder.countDocuments({
      status: "draft",
   });

   return {
      totalEmployees,

      presentToday,

      activeProjects,

      inventoryValue,

      monthlyExpense: monthlyExpenses[0]?.total || 0,

      pendingRequests,

      pendingPO,
   };
};
