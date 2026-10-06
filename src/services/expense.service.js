const Expense = require("../models/Expense");
const Project = require("../models/Project");
const PurchaseOrder = require("../models/PurchaseOrder");

const generateExpenseNo = require("../utils/generateExpenseNo");
const { notifyBudgetExceeded } = require("./notification.service");

// Actual project cost = non-PO expenses + delivered PO material cost
const actualProjectCost = async (projectId) => {
   const expenses = (await Expense.find()).filter(
      (e) => String(e.project) === String(projectId),
   );
   const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

   const purchaseOrders = (await PurchaseOrder.find()).filter(
      (po) => String(po.project) === String(projectId),
   );
   const materialCost = purchaseOrders
      .filter((po) => po.status === "delivered")
      .reduce((sum, po) => sum + Number(po.grandTotal || 0), 0);

   return totalExpenses + materialCost;
};

exports.createExpense = async (
   data,

   userId,
) => {
   const expenseNo = await generateExpenseNo();

   // Alert once, when this expense pushes the project to/past its budget
   let budgetAlert = null;
   if (data.project) {
      const project = await Project.findById(data.project);
      const budget = Number(project?.budget || 0);
      if (project && budget > 0) {
         const before = await actualProjectCost(project._id);
         const after = before + Number(data.amount || 0);
         if (before < budget && after >= budget) {
            budgetAlert = { project, after };
         }
      }
   }

   const expense = await Expense.create({
      ...data,

      expenseNo,

      createdBy: userId,
   });

   if (budgetAlert) {
      await notifyBudgetExceeded(budgetAlert.project, budgetAlert.after, userId).catch(() => {});
   }

   return expense;
};
