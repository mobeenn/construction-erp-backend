const ProgressUpdate = require("../../models/ProgressUpdate");
const { progressUpdateSchema } = require("../../validators/progressUpdate.validation");
const svc = require("../../services/progressUpdate.service");

exports.create = async (req, res) => {
   try {
      const data = progressUpdateSchema.parse(req.body);
      const update = await svc.createUpdate(data, req.user._id);
      res.status(201).json({ success: true, data: update });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.getAll = async (req, res) => {
   try {
      const { project, activity, status } = req.query;

      let updates = await ProgressUpdate.find()
         .populate("activity", "name activityCode")
         .populate("updatedBy", "name")
         .populate("approvedBy", "name");

      if (project) updates = updates.filter((u) => String(u.project) === project);
      if (activity) updates = updates.filter((u) => String(u.activity?._id || u.activity) === activity);
      if (status) updates = updates.filter((u) => u.status === status);

      updates.sort((a, b) => (a.updateDate < b.updateDate ? 1 : -1));

      res.status(200).json({ success: true, data: updates });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.approve = async (req, res) => {
   try {
      const update = await svc.approveUpdate(req.params.id, req.user._id);
      res.status(200).json({ success: true, data: update });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.reject = async (req, res) => {
   try {
      const update = await svc.rejectUpdate(req.params.id, req.user._id);
      res.status(200).json({ success: true, data: update });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};
