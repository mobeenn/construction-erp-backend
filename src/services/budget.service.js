const Budget = require("../models/Budget");
const Project = require("../models/Project");
const Expense = require("../models/Expense");
const PurchaseOrder = require("../models/PurchaseOrder");
const Contract = require("../models/Contract");
const { calculateProjectProgress } = require("./activity.service");
const generateBudgetCode = require("../utils/generateBudgetCode");

const EXPENSE_CATEGORY_MAP = {
   labour: "labour",
   fuel: "transportation",
   equipment: "equipment",
   office: "administration",
   transport: "transportation",
   maintenance: "equipment",
   other: "other",
};

const emptyCategoryActuals = () => ({
   labour: 0,
   materials: 0,
   equipment: 0,
   subcontractors: 0,
   transportation: 0,
   site_overhead: 0,
   administration: 0,
   other: 0,
});

exports.createBudget = async (data, userId) => {
   const budgetCode = await generateBudgetCode();

   const totalBudget = data.lines.reduce((s, l) => s + l.amount, 0);

   return await Budget.create({
      ...data,
      budgetCode,
      totalBudget,
      approvedBy: data.approvedBy || userId,
      approvedDate: data.approvedDate || new Date().toISOString(),
   });
};

exports.getProjectBudgetAnalysis = async (projectId) => {
   const project = await Project.findById(projectId);

   if (!project) throw new Error("Project not found");

   // active budget (latest version preferred)
   const budgets = (await Budget.find()).filter(
      (b) => String(b.project) === String(projectId),
   );

   const budget =
      budgets.find((b) => b.status === "active") ||
      budgets.sort((a, b) => b.version - a.version)[0] ||
      null;

   // actual costs
   const expenses = (await Expense.find()).filter(
      (e) => String(e.project) === String(projectId),
   );

   const pos = (await PurchaseOrder.find()).filter(
      (p) => String(p.project) === String(projectId),
   );

   const subcontracts = (await Contract.find()).filter(
      (c) => String(c.project) === String(projectId) && c.type === "subcontract",
   );

   const actual = emptyCategoryActuals();

   expenses.forEach((e) => {
      const key = EXPENSE_CATEGORY_MAP[e.category] || "other";
      actual[key] += e.amount;
   });

   // materials actual = delivered PO value
   actual.materials += pos
      .filter((p) => p.status === "delivered")
      .reduce((s, p) => s + (p.grandTotal || 0), 0);

   // subcontractor actual = subcontract values invoiced (use contract value as placeholder actual)
   actual.subcontractors += subcontracts.reduce(
      (s, c) => s + (c.value || 0),
      0,
   );

   const committed = {
      materials: pos
         .filter((p) => ["approved", "delivered"].includes(p.status))
         .reduce((s, p) => s + (p.grandTotal || 0), 0),
      subcontractors: subcontracts.reduce((s, c) => s + (c.value || 0), 0),
   };

   // per-category budget vs actual
   const categories = {};

   const budgetByCat = emptyCategoryActuals();

   if (budget) {
      budget.lines.forEach((l) => {
         budgetByCat[l.category] = (budgetByCat[l.category] || 0) + l.amount;
      });
   }

   Object.keys(budgetByCat).forEach((cat) => {
      const b = budgetByCat[cat] || 0;
      const a = actual[cat] || 0;
      const c = committed[cat] || a;

      categories[cat] = {
         budget: b,
         actual: a,
         committed: c,
         remaining: b - a,
         variance: b - a,
         variancePct: b > 0 ? Math.round(((b - a) / b) * 100) : 0,
         consumedPct: b > 0 ? Math.round((a / b) * 100) : 0,
      };
   });

   const totalBudget = budget ? budget.totalBudget : 0;

   const totalActual = Object.values(actual).reduce((s, v) => s + v, 0);

   const totalCommitted = Object.values(categories).reduce(
      (s, c) => s + (c.committed || 0),
      0,
   );

   // alerts
   const alerts = [];

   Object.entries(categories).forEach(([cat, v]) => {
      if (v.budget > 0 && v.actual > v.budget)
         alerts.push({ level: "over_budget", category: cat, consumedPct: v.consumedPct });
      else if (v.budget > 0 && v.consumedPct >= 100)
         alerts.push({ level: "critical", category: cat, consumedPct: v.consumedPct });
      else if (v.budget > 0 && v.consumedPct >= 80)
         alerts.push({ level: "warning", category: cat, consumedPct: v.consumedPct });
   });

   if (totalBudget > 0 && totalActual > totalBudget)
      alerts.push({ level: "over_budget", category: "TOTAL", consumedPct: Math.round((totalActual / totalBudget) * 100) });
   else if (totalBudget > 0 && totalActual / totalBudget >= 1)
      alerts.push({ level: "critical", category: "TOTAL", consumedPct: 100 });
   else if (totalBudget > 0 && totalActual / totalBudget >= 0.8)
      alerts.push({ level: "warning", category: "TOTAL", consumedPct: Math.round((totalActual / totalBudget) * 100) });

   // forecast (EVM-lite)
   const { progress } = await calculateProjectProgress(projectId);

   const earnedValue = totalBudget * (progress / 100);
   const cpi = totalActual > 0 ? earnedValue / totalActual : null;
   const estimatedFinalCost =
      cpi && cpi > 0 ? Math.round(totalBudget / cpi) : totalActual;

   const estimatedProfit = (project.contractValue || 0) - estimatedFinalCost;

   const estimatedMargin =
      project.contractValue > 0
         ? Math.round((estimatedProfit / project.contractValue) * 100)
         : 0;

   // monthly trend (expenses + delivered PO value)
   const trendMap = {};

   expenses.forEach((e) => {
      const month = String(e.expenseDate).slice(0, 7);
      trendMap[month] = (trendMap[month] || 0) + e.amount;
   });

   pos
      .filter((p) => p.status === "delivered")
      .forEach((p) => {
         const month = String(p.createdAt).slice(0, 7);
         trendMap[month] = (trendMap[month] || 0) + (p.grandTotal || 0);
      });

   const monthlyTrend = Object.entries(trendMap)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([month, amount]) => ({ month, amount }));

   return {
      budget,
      totalBudget,
      totalActual,
      totalCommitted,
      remaining: totalBudget - totalActual,
      variance: totalBudget - totalActual,
      variancePct: totalBudget > 0 ? Math.round(((totalBudget - totalActual) / totalBudget) * 100) : 0,
      consumedPct: totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0,
      categories,
      alerts,
      forecast: {
         overallProgress: progress,
         estimatedFinalCost,
         estimatedProfit,
         estimatedMargin,
         cpi: cpi ? Math.round(cpi * 100) / 100 : null,
      },
      monthlyTrend,
   };
};
