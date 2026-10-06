const Activity = require("../models/Activity");
const Project = require("../models/Project");
const generateActivityCode = require("../utils/generateActivityCode");
const { notifyActivityDelayed } = require("./notification.service");

const isDelayed = (activity) =>
   !!activity &&
   activity.status !== "completed" &&
   (activity.status === "delayed" ||
      (activity.plannedEnd && new Date(activity.plannedEnd) < new Date()));

// Weighted overall progress: uses activity.weight when available,
// otherwise plannedQuantity, otherwise equal weights (count).
exports.calculateProjectProgress = async (projectId) => {
   const activities = (await Activity.find()).filter(
      (a) => String(a.project) === String(projectId),
   );

   if (activities.length === 0) return { progress: 0, activities: [] };

   let weightOf = (a) => a.weight;
   const anyWeight = activities.some((a) => a.weight > 0);
   const anyQty = activities.some((a) => a.plannedQuantity > 0);

   if (!anyWeight && anyQty) weightOf = (a) => a.plannedQuantity;
   if (!anyWeight && !anyQty) weightOf = () => 1;

   const totalWeight = activities.reduce((s, a) => s + (weightOf(a) || 0), 0);

   const progress =
      totalWeight > 0
         ? Math.round(
              activities.reduce(
                 (s, a) => s + (weightOf(a) || 0) * (a.actualPercentage || 0),
                 0,
              ) / totalWeight,
           )
         : 0;

   return { progress, activities };
};

exports.recalculateProjectProgress = async (projectId) => {
   const { progress } = await exports.calculateProjectProgress(projectId);

   const project = await Project.findById(projectId);

   if (project) {
      project.progress = progress;
      await project.save();
   }

   return progress;
};

exports.listActivities = async ({ project, status, responsible, delayedOnly }) => {
   let activities = await Activity.find()
      .populate("assignedTo", "name")
      .populate("responsible", "name");

   if (project) {
      activities = activities.filter(
         (a) => String(a.project) === project,
      );
   }

   if (status) activities = activities.filter((a) => a.status === status);

   if (responsible) {
      activities = activities.filter(
         (a) =>
            String(a.responsible?._id || a.responsible) === responsible ||
            String(a.assignedTo?._id || a.assignedTo) === responsible,
      );
   }

   if (delayedOnly === "true" || delayedOnly === true) {
      const today = new Date();

      activities = activities.filter(
         (a) =>
            a.status === "delayed" ||
            (a.status !== "completed" &&
               a.plannedEnd &&
               new Date(a.plannedEnd) < today),
      );
   }

   return activities;
};

exports.createActivity = async (data) => {
   const activityCode = data.activityCode || (await generateActivityCode());

   const activity = await Activity.create({
      ...data,
      activityCode,
      title: data.title || data.name,
      name: data.name || data.title,
   });

   await exports.recalculateProjectProgress(data.project);

   return activity;
};

exports.updateActivity = async (id, data, userId) => {
   const before = await Activity.findById(id);

   const activity = await Activity.findByIdAndUpdate(id, data, { new: true });

   if (activity) {
      await exports.recalculateProjectProgress(activity.project);

      if (userId && isDelayed(activity) && !isDelayed(before)) {
         const project = await Project.findById(activity.project);
         const populated = await Activity.findById(activity._id)
            .populate("project", "name")
            .populate("assignedTo", "name");
         await notifyActivityDelayed(populated, project, userId).catch(() => {});
      }
   }

   return activity;
};

exports.deleteActivity = async (id) => {
   const activity = await Activity.findById(id);
   const removed = await Activity.findByIdAndDelete(id);

   if (activity) {
      await exports.recalculateProjectProgress(activity.project);
   }

   return removed;
};
