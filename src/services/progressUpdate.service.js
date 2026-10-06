const ProgressUpdate = require("../models/ProgressUpdate");
const Activity = require("../models/Activity");
const { recalculateProjectProgress } = require("./activity.service");

exports.createUpdate = async (data, userId) => {
   const activity = await Activity.findById(data.activity);

   if (!activity) throw new Error("Activity not found");

   return await ProgressUpdate.create({
      project: data.project,
      activity: data.activity,
      updateDate: data.updateDate || new Date().toISOString(),
      previousProgress: activity.actualPercentage || 0,
      newProgress: data.newProgress,
      quantityCompleted: data.quantityCompleted,
      remarks: data.remarks,
      updatedBy: userId,
      status: "pending",
   });
};

exports.approveUpdate = async (id, userId) => {
   const update = await ProgressUpdate.findById(id);

   if (!update) throw new Error("Update not found");

   if (update.status !== "pending")
      throw new Error("Update already reviewed");

   const activity = await Activity.findById(update.activity);

   if (activity) {
      activity.actualPercentage = update.newProgress;
      activity.progress = update.newProgress;

      if (typeof update.quantityCompleted === "number")
         activity.completedQuantity = update.quantityCompleted;

      if (!activity.actualStart) activity.actualStart = update.updateDate;

      if (update.newProgress >= 100) {
         activity.status = "completed";
         activity.actualEnd = update.updateDate;
      } else if (activity.status === "not_started") {
         activity.status = "in_progress";
      }

      await activity.save();
   }

   update.status = "approved";
   update.approvedBy = userId;
   update.approvedAt = new Date().toISOString();
   await update.save();

   await recalculateProjectProgress(update.project);

   return update;
};

exports.rejectUpdate = async (id, userId) => {
   const update = await ProgressUpdate.findById(id);

   if (!update) throw new Error("Update not found");

   update.status = "rejected";
   update.approvedBy = userId;
   update.approvedAt = new Date().toISOString();
   await update.save();

   return update;
};
