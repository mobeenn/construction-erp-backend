const Project = require("../models/Project");

const generateProjectCode = require("../utils/generateProjectCode");

const Expense = require("../models/Expense");
const PurchaseOrder = require("../models/PurchaseOrder");
const ProgressReport = require("../models/ProgressReport");
const InterimPayment = require("../models/InterimPayment");
const { calculateProjectProgress } = require("./activity.service");

exports.createProject = async (data) => {
   const projectCode = await generateProjectCode();

   return await Project.create({
      ...data,

      projectCode,
   });
};

exports.getProjectDashboard = async (projectId) => {
   const project = await Project.findById(projectId);

   if (!project) throw new Error("Project not found");

   const expenses = (await Expense.find()).filter(
      (e) => String(e.project) === String(projectId),
   );

   const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

   const labourCost = expenses
      .filter((e) => e.category === "labour")
      .reduce((sum, e) => sum + e.amount, 0);

   const purchaseOrders = (await PurchaseOrder.find()).filter(
      (po) => String(po.project) === String(projectId),
   );

   const purchaseCost = purchaseOrders.reduce(
      (sum, po) => sum + (po.grandTotal || 0),
      0,
   );

   const materialCost = purchaseOrders
      .filter((po) => po.status === "delivered")
      .reduce((sum, po) => sum + (po.grandTotal || 0), 0);

   const actualCost = totalExpenses + materialCost;

   const budget = project.budget || 0;
   const remainingBudget = budget - actualCost;

   const progressReports = (await ProgressReport.find())
      .filter((r) => String(r.project) === String(projectId))
      .sort((a, b) => (a.date < b.date ? 1 : -1));

   const { progress: activityProgress, activities } =
      await calculateProjectProgress(projectId);

   const overallProgress =
      activities.length > 0
         ? activityProgress
         : progressReports.length > 0
           ? progressReports[0].percentComplete
           : project.progress || 0;

   // planned progress from schedule
   let plannedProgress = 0;

   if (project.startDate && project.endDate) {
      const start = new Date(project.startDate).getTime();
      const end = new Date(project.endDate).getTime();
      const now = Date.now();

      if (end > start) {
         plannedProgress = Math.min(
            100,
            Math.max(0, Math.round(((now - start) / (end - start)) * 100)),
         );
      }
   }

   const scheduleVariance = overallProgress - plannedProgress;

   const bills = (await InterimPayment.find()).filter(
      (b) => String(b.project) === String(projectId),
   );

   const amountBilled = bills.reduce(
      (sum, b) => sum + (b.grossAmount || 0),
      0,
   );

   const amountReceived = bills
      .filter((b) => b.status === "paid")
      .reduce((sum, b) => sum + (b.netAmount || 0), 0);

   const outstandingAmount = amountBilled - amountReceived;

   return {
      contractValue: project.contractValue || 0,
      budget,
      actualCost,
      remainingBudget,
      overallProgress,
      plannedProgress,
      scheduleVariance,
      totalExpenses,
      materialCost,
      labourCost,
      purchaseCost,
      amountBilled,
      amountReceived,
      outstandingAmount,
   };
};
