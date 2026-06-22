const Project = require("../models/Project");

const Expense = require("../models/Expense");

exports.calculateProfitLoss = async () => {
   const projects = await Project.find();

   const report = [];

   for (const project of projects) {
      const expenses = await Expense.aggregate([
         {
            $match: {
               project: project._id,
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

      const totalExpense = expenses[0]?.total || 0;

      const profit = project.receivedAmount - totalExpense;

      report.push({
         projectName: project.name,

         revenue: project.receivedAmount,

         expense: totalExpense,

         profit,

         status: profit >= 0 ? "profit" : "loss",
      });
   }

   return report;
};
