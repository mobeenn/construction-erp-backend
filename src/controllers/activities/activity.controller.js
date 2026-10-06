const Activity = require("../../models/Activity");
const { activitySchema } = require("../../validators/activity.validation");
const svc = require("../../services/activity.service");

exports.create = async (req, res) => {
   try {
      const data = activitySchema.parse(req.body);
      const activity = await svc.createActivity(data);
      res.status(201).json({ success: true, data: activity });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.getAll = async (req, res) => {
   try {
      const data = await svc.listActivities({
         project: req.query.project,
         status: req.query.status,
         responsible: req.query.responsible,
         delayedOnly: req.query.delayed,
      });

      res.status(200).json({ success: true, data });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.update = async (req, res) => {
   try {
      const data = activitySchema.partial().parse(req.body);
      const activity = await svc.updateActivity(req.params.id, data, req.user._id);
      res.status(200).json({ success: true, data: activity });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.remove = async (req, res) => {
   try {
      await svc.deleteActivity(req.params.id);
      res.status(200).json({ success: true, message: "Activity deleted" });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

