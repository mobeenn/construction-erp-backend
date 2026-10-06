const ProgressReport = require("../../models/ProgressReport");
const { progressSchema } = require("../../validators/progressReport.validation");
const { createProgress } = require("../../services/progress.service");

exports.create = async (req, res) => {
   try {
      const data = progressSchema.parse(req.body);
      const report = await createProgress(data, req.user._id);
      res.status(201).json({ success: true, data: report });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.getAll = async (req, res) => {
   try {
      const { project } = req.query;

      let reports = await ProgressReport.find().populate("reportedBy", "name");

      if (project) reports = reports.filter((r) => String(r.project) === project);

      reports.sort((a, b) => (a.date < b.date ? 1 : -1));

      res.status(200).json({ success: true, data: reports });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};
