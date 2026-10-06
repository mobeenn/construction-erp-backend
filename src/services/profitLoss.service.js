const Project = require("../models/Project");

const Expense = require("../models/Expense");

const PurchaseOrder = require("../models/PurchaseOrder");

exports.calculateProfitLoss = async () => {
   const projects = await Project.find();

   const expenses = await Expense.find();

   const pos = await PurchaseOrder.find();

   const report = [];

   for (const project of projects) {
      const projectExpenses = expenses.filter(
         (e) => String(e.project) === String(project._id),
      );

      const expenseTotal = projectExpenses.reduce(
         (sum, e) => sum + e.amount,
         0,
      );

      // improved cost calculation: include delivered materials from POs
      const materialCost = pos
         .filter(
            (p) =>
               String(p.project) === String(project._id) &&
               p.status === "delivered",
         )
         .reduce((sum, p) => sum + (p.grandTotal || 0), 0);

      const totalExpense = expenseTotal + materialCost;

      const profit = (project.receivedAmount || 0) - totalExpense;

      report.push({
         projectName: project.name,

         revenue: project.receivedAmount || 0,

         expense: totalExpense,

         profit,

         status: profit >= 0 ? "profit" : "loss",
      });
   }

   return report;
};

