const DailyReport = require("../models/DailyReport");
const Project = require("../models/Project");
const Activity = require("../models/Activity");
const Inventory = require("../models/Inventory");
const InventoryTransaction = require("../models/InventoryTransaction");
const { recalculateProjectProgress } = require("./activity.service");
const {
   notifyDailyReportSubmitted,
   notifyActivityDelayed,
} = require("./notification.service");

const sameId = (left, right) => String(left?._id || left) === String(right?._id || right);

const isDelayed = (activity) =>
   !!activity &&
   activity.status !== "completed" &&
   (activity.status === "delayed" ||
      (activity.plannedEnd && new Date(activity.plannedEnd) < new Date()));

exports.createReport = async (data, user, attachments) => {
   const project = await Project.findById(data.project);
   if (!project) throw new Error("Project not found");
   if (user.role === "site_supervisor" &&
      ![project.siteSupervisor, project.supervisor].filter(Boolean).some((id) => sameId(id, user._id))) {
      throw new Error("You are not assigned to this project's site");
   }

   for (const item of data.activities) {
      const activity = await Activity.findById(item.activity);
      if (!activity || !sameId(activity.project, project._id)) {
         throw new Error("Every activity must belong to the selected project");
      }
   }
   for (const item of [...data.materialConsumed, ...data.materialReceived]) {
      const inventory = await Inventory.findById(item.inventory);
      if (!inventory || !sameId(inventory.project, project._id)) {
         throw new Error("Every material must be project inventory");
      }
   }

   const report = await DailyReport.create({
      ...data,
      reportDate: new Date(`${data.reportDate}T00:00:00.000Z`).toISOString(),
      siteSupervisor: user._id,
      attachments,
   });

   const populated = await DailyReport.findById(report._id)
      .populate("project", "name projectCode")
      .populate("siteSupervisor", "name");

   await notifyDailyReportSubmitted(populated, project, user).catch(() => {});

   return report;
};

exports.listReports = async ({ user, project, status, date }) => {
   let reports = await DailyReport.find()
      .populate("project", "name projectCode location")
      .populate("siteSupervisor", "name")
      .populate("reviewedBy", "name");
   if (user.role === "site_supervisor") {
      reports = reports.filter((report) => sameId(report.siteSupervisor?._id || report.siteSupervisor, user._id));
   }
   if (user.role === "project_manager") {
      const managedProjects = (await Project.find())
         .filter((item) => sameId(item.projectManager, user._id))
         .map((item) => String(item._id));
      reports = reports.filter((report) => managedProjects.includes(String(report.project?._id || report.project)));
   }
   if (project) reports = reports.filter((report) => sameId(report.project?._id || report.project, project));
   if (status) reports = reports.filter((report) => report.status === status);
   if (date) reports = reports.filter((report) => String(report.reportDate).slice(0, 10) === date);
   return reports.sort((a, b) => String(b.reportDate).localeCompare(String(a.reportDate)));
};

exports.approveReport = async (id, user) => {
   const report = await DailyReport.findById(id);
   if (!report) throw new Error("Daily report not found");
   if (report.status !== "pending") throw new Error("Only pending reports can be approved");
   if (user.role === "project_manager") {
      const project = await Project.findById(report.project);
      if (!project || !sameId(project.projectManager, user._id)) {
         throw new Error("You can only review reports for projects you manage");
      }
   }

   const inventoryById = new Map();
   const consumedTotals = new Map();
   for (const item of report.materialConsumed || []) {
      const inventory = await Inventory.findById(item.inventory);
      if (!inventory) throw new Error("A consumed material no longer exists");
      inventoryById.set(String(inventory._id), inventory);
      consumedTotals.set(String(inventory._id), (consumedTotals.get(String(inventory._id)) || 0) + Number(item.quantity));
   }
   for (const item of report.materialReceived || []) {
      const inventory = await Inventory.findById(item.inventory);
      if (!inventory) throw new Error("A received material no longer exists");
      inventoryById.set(String(inventory._id), inventory);
   }
   const receivedTotals = new Map();
   for (const item of report.materialReceived || []) {
      const key = String(item.inventory);
      receivedTotals.set(key, (receivedTotals.get(key) || 0) + Number(item.quantity));
   }
   for (const [inventoryId, consumed] of consumedTotals) {
      const inventory = inventoryById.get(inventoryId);
      if (consumed > Number(inventory.currentStock || 0) + (receivedTotals.get(inventoryId) || 0)) {
         throw new Error(`Insufficient stock for ${inventory.materialName}`);
      }
   }
   const activities = [];
   for (const item of report.activities || []) {
      const activity = await Activity.findById(item.activity);
      if (!activity) throw new Error("A linked activity no longer exists");
      activities.push({ item, activity });
   }

   for (const item of report.materialReceived || []) {
      const inventory = inventoryById.get(String(item.inventory));
      inventory.currentStock = Number(inventory.currentStock || 0) + item.quantity;
      inventory.receivedQuantity = Number(inventory.receivedQuantity || 0) + item.quantity;
      await inventory.save();
      await InventoryTransaction.create({
         inventory: inventory._id,
         project: report.project,
         warehouse: inventory.warehouse,
         type: "stock_in",
         quantity: item.quantity,
         remarks: `Daily report ${report._id} material received`,
         balanceAfter: inventory.currentStock,
         createdBy: report.siteSupervisor,
      });
   }
   for (const item of report.materialConsumed || []) {
      const inventory = inventoryById.get(String(item.inventory));
      inventory.currentStock = Number(inventory.currentStock || 0) - item.quantity;
      inventory.issuedQuantity = Number(inventory.issuedQuantity || 0) + item.quantity;
      await inventory.save();
      await InventoryTransaction.create({
         inventory: inventory._id,
         project: report.project,
         warehouse: inventory.warehouse,
         type: "stock_out",
         quantity: item.quantity,
         remarks: `Daily report ${report._id} material consumption`,
         balanceAfter: inventory.currentStock,
         createdBy: report.siteSupervisor,
      });
   }

   const delayedActivities = [];
   for (const { item, activity } of activities) {
      const wasDelayed = isDelayed(activity);
      if (item.progress !== undefined) {
         activity.actualPercentage = item.progress;
         activity.progress = item.progress;
         if (!activity.actualStart) activity.actualStart = report.reportDate;
         if (item.status) {
            activity.status = item.status;
         } else if (item.progress >= 100) {
            activity.status = "completed";
            activity.actualEnd = report.reportDate;
         } else if (activity.status === "not_started") {
            activity.status = "in_progress";
         }
      }
      if (item.status && item.progress === undefined) activity.status = item.status;
      if (item.status === "completed" && !activity.actualEnd) activity.actualEnd = report.reportDate;
      if (item.quantityCompleted !== undefined) activity.completedQuantity = item.quantityCompleted;
      if (item.remarks) activity.remarks = item.remarks;
      await activity.save();
      if (!wasDelayed && isDelayed(activity)) delayedActivities.push(activity);
   }

   for (const activity of delayedActivities) {
      const populated = await Activity.findById(activity._id)
         .populate("project", "name")
         .populate("assignedTo", "name");
      await notifyActivityDelayed(populated, project, user._id).catch(() => {});
   }

   report.status = "approved";
   report.reviewedBy = user._id;
   report.reviewedAt = new Date().toISOString();
   await report.save();
   await recalculateProjectProgress(report.project);
   return report;
};

exports.rejectReport = async (id, user, reviewNote = "") => {
   const report = await DailyReport.findById(id);
   if (!report) throw new Error("Daily report not found");
   if (report.status !== "pending") throw new Error("Only pending reports can be rejected");
   if (user.role === "project_manager") {
      const project = await Project.findById(report.project);
      if (!project || !sameId(project.projectManager, user._id)) {
         throw new Error("You can only review reports for projects you manage");
      }
   }
   report.status = "rejected";
   report.reviewedBy = user._id;
   report.reviewedAt = new Date().toISOString();
   report.reviewNote = reviewNote;
   await report.save();
   return report;
};
