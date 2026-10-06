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
   const todayStr = today.toISOString().slice(0, 10);

   // Employees
   const totalEmployees = await Employee.countDocuments();

   // Attendance
   const todaysAttendance = await Attendance.find({});

   const presentToday = todaysAttendance.filter(
      (a) => a.status === "present" && String(a.date).slice(0, 10) >= todayStr,
   ).length;

   // Projects
   const activeProjects = await Project.countDocuments({
      status: { $in: ["in_progress", "active"] },
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

   const expenses = await Expense.find();

   const monthlyExpense = expenses
      .filter((e) => new Date(e.expenseDate) >= firstDay)
      .reduce((sum, e) => sum + e.amount, 0);

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

      monthlyExpense,

      pendingRequests,

      pendingPO,
   };
};
