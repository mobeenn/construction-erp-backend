const Project = require("../models/Project");
const Activity = require("../models/Activity");
const ProgressUpdate = require("../models/ProgressUpdate");
const { calculateProjectProgress } = require("./activity.service");

exports.getProgressDashboard = async (projectId) => {
   const project = await Project.findById(projectId);

   if (!project) throw new Error("Project not found");

   const activities = (await Activity.find()).filter(
      (a) => String(a.project) === String(projectId),
   );

   const { progress: overallProgress } =
      await calculateProjectProgress(projectId);

   const today = new Date();
   today.setHours(0, 0, 0, 0);

   const completed = activities.filter((a) => a.status === "completed").length;

   const inProgress = activities.filter(
      (a) => a.status === "in_progress",
   ).length;

   const delayed = activities.filter(
      (a) =>
         a.status === "delayed" ||
         (a.status !== "completed" &&
            a.plannedEnd &&
            new Date(a.plannedEnd) < today),
   ).length;

   const upcoming = activities.filter(
      (a) =>
         a.status === "not_started" &&
         a.plannedStart &&
         new Date(a.plannedStart) >= today &&
         new Date(a.plannedStart) - today <= 7 * 24 * 60 * 60 * 1000,
   ).length;

   const overdue = activities.filter(
      (a) =>
         a.status !== "completed" &&
         a.plannedEnd &&
         new Date(a.plannedEnd) < today,
   ).length;

   // planned vs actual
   const totalPlannedWeight = activities.reduce(
      (s, a) => s + (a.weight || a.plannedQuantity || 1),
      0,
   );

   const plannedProgress =
      totalPlannedWeight > 0
         ? Math.round(
              activities.reduce(
                 (s, a) =>
                    s +
                    (a.weight || a.plannedQuantity || 1) *
                       (a.plannedPercentage || 0),
                 0,
              ) / totalPlannedWeight,
           )
         : 0;

   // average delay of activities past their planned end
   const delays = activities
      .filter(
         (a) =>
            a.status !== "completed" &&
            a.plannedEnd &&
            new Date(a.plannedEnd) < today,
      )
      .map((a) => Math.floor((today - new Date(a.plannedEnd)) / 86400000));

   const delayDays =
      delays.length > 0
         ? Math.round(delays.reduce((s, d) => s + d, 0) / delays.length)
         : 0;

   // progress history from approved updates
   const history = (await ProgressUpdate.find())
      .filter(
         (u) =>
            String(u.project) === String(projectId) &&
            u.status === "approved",
      )
      .sort((a, b) => (a.updateDate < b.updateDate ? -1 : 1))
      .map((u) => ({
         date: u.updateDate,
         progress: u.newProgress,
      }));

   const pendingUpdates = (await ProgressUpdate.find()).filter(
      (u) =>
         String(u.project) === String(projectId) && u.status === "pending",
   ).length;

   return {
      overallProgress,
      plannedProgress,
      variance: overallProgress - plannedProgress,
      delayDays,
      total: activities.length,
      completed,
      inProgress,
      delayed,
      upcoming,
      overdue,
      pendingUpdates,
      history,
   };
};
