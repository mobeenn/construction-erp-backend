const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Project = require("../models/Project");
const Inventory = require("../models/Inventory");
const Expense = require("../models/Expense");
const MaterialRequest = require("../models/MaterialRequest");
const MaterialIssue = require("../models/MaterialIssue");
const PurchaseOrder = require("../models/PurchaseOrder");
const InterimPayment = require("../models/InterimPayment");

const SERIES = {
   brand: "#2A7B9B",
   mint: "#57C785",
   sun: "#EDDD53",
   steel: "#7DBCCD",
   amber: "#D9A441",
   deep: "#23657F",
   red: "#E05252",
   green: "#4DAF8A",
};

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const monthKey = (d) => String(d).slice(0, 7);
const monthLabel = (key) => {
   const [y, m] = key.split("-");
   const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
   return `${names[Number(m) - 1]} '${y.slice(2)}`;
};

const lastMonths = (count) => {
   const out = [];
   const now = new Date();
   for (let i = count - 1; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
   }
   return out;
};

const sumBy = (arr, fn) => arr.reduce((sum, item) => sum + num(fn(item)), 0);

const groupSum = (arr, keyFn, valFn) => {
   const map = {};
   arr.forEach((item) => {
      const key = keyFn(item);
      if (key === undefined || key === null || key === "") return;
      map[key] = (map[key] || 0) + num(valFn(item));
   });
   return map;
};

const groupCount = (arr, keyFn) => {
   const map = {};
   arr.forEach((item) => {
      const key = keyFn(item);
      if (key === undefined || key === null || key === "") return;
      map[key] = (map[key] || 0) + 1;
   });
   return map;
};

const humanize = (value) =>
   String(value || "Unknown")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

exports.getAnalytics = async () => {
   const now = new Date();
   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
   const todayStr = today.toISOString().slice(0, 10);

   const [
      employees,
      attendance,
      projects,
      inventory,
      expenses,
      materialRequests,
      materialIssues,
      purchaseOrders,
      interimPayments,
   ] = await Promise.all([
      Employee.find(),
      Attendance.find(),
      Project.find(),
      Inventory.find(),
      Expense.find(),
      MaterialRequest.find(),
      MaterialIssue.find(),
      PurchaseOrder.find(),
      InterimPayment.find(),
   ]);

   /*
   |--------------------------------------------------------------------------
   | KPIs
   |--------------------------------------------------------------------------
   */
   const totalEmployees = employees.length;
   const activeEmployeeCount = employees.filter((e) => e.status === "active").length;
   const activeProjects = projects.filter((p) =>
      ["in_progress", "active"].includes(p.status),
   ).length;
   const totalProjects = projects.length;

   const presentToday = attendance.filter(
      (a) => a.status === "present" && String(a.date).slice(0, 10) >= todayStr,
   ).length;
   const markedToday = attendance.filter(
      (a) => String(a.date).slice(0, 10) >= todayStr,
   ).length;
   const presentRate =
      markedToday > 0 ? Math.round((presentToday / markedToday) * 100) : 0;

   const inventoryValue = sumBy(inventory, (i) => num(i.currentStock) * num(i.unitPrice));

   const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
   const monthlyExpense = sumBy(
      expenses.filter((e) => new Date(e.expenseDate) >= firstDayOfMonth),
      (e) => e.amount,
   );

   const pendingRequests = materialRequests.filter((r) => r.status === "pending").length;
   const pendingPO = purchaseOrders.filter((p) => p.status === "draft").length;

   const totalContractValue = sumBy(projects, (p) => p.contractValue);
   const totalReceived = sumBy(projects, (p) => p.receivedAmount);
   const totalBudget = sumBy(projects, (p) => p.budget);

   const deliveredPOValue = sumBy(
      purchaseOrders.filter((p) => p.status === "delivered"),
      (p) => p.grandTotal,
   );
   const totalExpenses = sumBy(expenses, (e) => e.amount);
   const totalActualCost = totalExpenses + deliveredPOValue;

   const lowStock = inventory.filter(
      (i) => num(i.currentStock) <= num(i.minimumStock),
   );

   const outstanding = interimPayments.reduce(
      (sum, ip) => sum + num(ip.outstandingAmount || (num(ip.approvedAmount) - num(ip.paidAmount))),
      0,
   );

   /*
   |--------------------------------------------------------------------------
   | Monthly timeline (last 6 months)
   |--------------------------------------------------------------------------
   */
   const months = lastMonths(6);

   const expenseByMonth = groupSum(expenses, (e) => monthKey(e.expenseDate), (e) => e.amount);
   const poByMonth = groupSum(purchaseOrders, (p) => monthKey(p.createdAt), (p) => p.grandTotal);
   const interimByMonth = groupSum(
      interimPayments,
      (ip) => monthKey(ip.createdAt || ip.date),
      (ip) => num(ip.approvedAmount) || num(ip.paidAmount),
   );

   const monthlyExpenses = months.map((m) => expenseByMonth[m] || 0);
   const monthlyProcurement = months.map((m) => poByMonth[m] || 0);
   const monthlyRevenue = months.map((m) => interimByMonth[m] || 0);

   /*
   |--------------------------------------------------------------------------
   | Projects
   |--------------------------------------------------------------------------
   */
   const projectProgress = [...projects]
      .map((p) => ({
         name: p.name,
         code: p.projectCode,
         progress: num(p.progress),
         status: p.status,
         budget: num(p.budget),
      }))
      .sort((a, b) => b.progress - a.progress);

   const projectStatusCounts = groupCount(projects, (p) => p.status);
   const projectStatus = Object.entries(projectStatusCounts).map(([name, value]) => ({
      name: humanize(name),
      value,
   }));

   const spentByProject = {};
   expenses.forEach((e) => {
      spentByProject[e.project] = (spentByProject[e.project] || 0) + num(e.amount);
   });
   purchaseOrders
      .filter((p) => p.status === "delivered")
      .forEach((p) => {
         spentByProject[p.project] = (spentByProject[p.project] || 0) + num(p.grandTotal);
      });

   const budgetProjects = [...projects]
      .map((p) => ({
         name: p.projectCode || p.name,
         fullName: p.name,
         budget: num(p.budget),
         spent: spentByProject[p._id] || 0,
      }))
      .sort((a, b) => b.budget - a.budget)
      .slice(0, 6);

   const topProjects = [...projects]
      .map((p) => ({
         name: p.name,
         code: p.projectCode,
         progress: num(p.progress),
         budget: num(p.budget),
         spent: spentByProject[p._id] || 0,
         received: num(p.receivedAmount),
         contractValue: num(p.contractValue),
      }))
      .sort((a, b) => b.contractValue - a.contractValue)
      .slice(0, 5);

   /*
   |--------------------------------------------------------------------------
   | Procurement
   |--------------------------------------------------------------------------
   */
   const poStatusCounts = groupCount(purchaseOrders, (p) => p.status);
   const procurementStatus = Object.entries(poStatusCounts).map(([name, value]) => ({
      name: humanize(name),
      value,
   }));

   const vendorTotals = groupSum(purchaseOrders, (p) => p.vendor, (p) => p.grandTotal);
   const procurementByVendor = Object.entries(vendorTotals)
      .map(([_, value]) => value)
      .sort((a, b) => b - a)
      .slice(0, 5);

   /*
   |--------------------------------------------------------------------------
   | Workforce
   |--------------------------------------------------------------------------
   */
   const designationCounts = groupCount(employees, (e) => e.designation || "Unassigned");
   const workforceByDesignation = Object.entries(designationCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

   const attendanceCounts = groupCount(
      attendance.filter((a) => String(a.date).slice(0, 10) >= todayStr),
      (a) => a.status,
   );
   const attendanceStatus = Object.entries(attendanceCounts).map(([name, value]) => ({
      name: humanize(name),
      value,
   }));
   if (attendanceStatus.length === 0) {
      attendanceStatus.push(
         { name: "Present", value: 0 },
         { name: "Absent", value: 0 },
      );
   }

   const overtimeByEmployee = groupSum(
      employees.filter((e) => e.status === "active"),
      (e) => e.name,
      () => 0,
   );
   const overtimeTrend = months.map((m) =>
      sumBy(
         attendance.filter((a) => monthKey(a.date) === m),
         (a) => a.overtimeHours,
      ),
   );
   void overtimeByEmployee;

   /*
   |--------------------------------------------------------------------------
   | Materials
   |--------------------------------------------------------------------------
   */
   const materialMap = {};
   inventory.forEach((i) => {
      const key = i.materialName || "Unknown";
      if (!materialMap[key]) {
         materialMap[key] = { name: key, received: 0, issued: 0, stock: 0, value: 0 };
      }
      materialMap[key].received += num(i.receivedQuantity) + num(i.openingQuantity);
      materialMap[key].issued += num(i.issuedQuantity);
      materialMap[key].stock += num(i.currentStock);
      materialMap[key].value += num(i.currentStock) * num(i.unitPrice);
   });
   const materials = Object.values(materialMap).sort((a, b) => b.value - a.value);
   const materialUsage = materials.slice(0, 6);

   const materialValueDonut = materials
      .slice(0, 6)
      .map((m) => ({ name: m.name, value: m.value }));

   const totalIssued = sumBy(materialIssues, (mi) =>
      sumBy(mi.items || [], (it) => it.quantity),
   );

   /*
   |--------------------------------------------------------------------------
   | Expenses breakdown
   |--------------------------------------------------------------------------
   */
   const expenseByCategory = groupSum(expenses, (e) => e.category || "Other", (e) => e.amount);
   const expenseBreakdown = Object.entries(expenseByCategory)
      .map(([name, value]) => ({ name: humanize(name), value }))
      .sort((a, b) => b.value - a.value);

   return {
      kpis: {
         totalEmployees,
         activeEmployeeCount,
         presentToday,
         presentRate,
         activeProjects,
         totalProjects,
         inventoryValue,
         monthlyExpense,
         pendingRequests,
         pendingPO,
         totalContractValue,
         totalReceived,
         totalBudget,
         totalActualCost,
         totalExpenses,
         deliveredPOValue,
         outstanding,
         lowStockCount: lowStock.length,
         materialsTracked: inventory.length,
         totalIssued,
      },
      projectProgress,
      projectStatus,
      budgetVsActual: {
         labels: budgetProjects.map((p) => p.name),
         series: [
            { name: "Budget", data: budgetProjects.map((p) => p.budget), color: SERIES.brand },
            { name: "Actual Cost", data: budgetProjects.map((p) => p.spent), color: SERIES.amber },
         ],
      },
      revenueVsExpense: {
         labels: months.map(monthLabel),
         series: [
            { name: "Revenue", data: monthlyRevenue, color: SERIES.mint },
            { name: "Expenses", data: monthlyExpenses, color: SERIES.brand },
         ],
      },
      monthlyPerformance: {
         labels: months.map(monthLabel),
         series: [
            { name: "Procurement", data: monthlyProcurement, color: SERIES.sun },
            { name: "Expenses", data: monthlyExpenses, color: SERIES.brand },
         ],
      },
      procurementStatus,
      procurementByVendor,
      workforceByDesignation,
      attendanceStatus,
      overtimeTrend: {
         labels: months.map(monthLabel),
         series: [{ name: "Overtime Hours", data: overtimeTrend, color: SERIES.deep }],
      },
      materialUsage: {
         labels: materialUsage.map((m) => m.name),
         series: [
            { name: "Received", data: materialUsage.map((m) => m.received), color: SERIES.brand },
            { name: "Issued", data: materialUsage.map((m) => m.issued), color: SERIES.mint },
         ],
      },
      materialValueDonut,
      expenseBreakdown,
      topProjects,
      lowStock: lowStock
         .map((i) => ({
            name: i.materialName,
            stock: num(i.currentStock),
            minimum: num(i.minimumStock),
            unit: i.unit,
            project: i.project,
         }))
         .slice(0, 6),
   };
};
