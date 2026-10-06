const fs = require("fs");
const path = require("path");
const { dailyReportSchema } = require("../../validators/dailyReport.validation");
const service = require("../../services/dailyReport.service");

const removeUploadedFiles = (files = []) => files.forEach((file) => {
   try {
      fs.unlinkSync(file.path);
   } catch (error) {
      if (error.code !== "ENOENT") throw error;
   }
});

exports.create = async (req, res) => {
   try {
      const reportInput = JSON.parse(req.body.report || "{}");
      const data = dailyReportSchema.parse(reportInput);
      const attachments = (req.files || []).map((file) => ({
         name: file.originalname,
         type: file.mimetype,
         url: `/uploads/daily-reports/${file.filename}`,
         size: file.size,
      }));
      const report = await service.createReport(data, req.user, attachments);
      res.status(201).json({ success: true, data: report });
   } catch (error) {
      removeUploadedFiles(req.files);
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.getAll = async (req, res) => {
   try {
      const data = await service.listReports({
         user: req.user,
         project: req.query.project,
         status: req.query.status,
         date: req.query.date,
      });
      res.status(200).json({ success: true, data });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

exports.approve = async (req, res) => {
   try {
      const data = await service.approveReport(req.params.id, req.user);
      res.status(200).json({ success: true, data });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.reject = async (req, res) => {
   try {
      const data = await service.rejectReport(req.params.id, req.user, req.body?.reviewNote);
      res.status(200).json({ success: true, data });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

exports.downloadAttachment = async (req, res) => {
   try {
      const reports = await service.listReports({ user: req.user });
      const report = reports.find((item) =>
         (item.attachments || []).some((file) => path.basename(file.url) === req.params.fileName),
      );
      if (!report) return res.status(404).json({ success: false, message: "Attachment not found" });
      const attachment = report.attachments.find((file) => path.basename(file.url) === req.params.fileName);
      const filePath = path.join(__dirname, "..", "..", "..", "uploads", "daily-reports", req.params.fileName);
      if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: "Attachment file is missing" });
      return res.download(filePath, attachment.name);
   } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
   }
};
