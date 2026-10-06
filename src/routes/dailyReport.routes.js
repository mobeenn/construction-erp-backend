const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const controller = require("../controllers/dailyReports/dailyReport.controller");

const uploadDirectory = process.env.VERCEL
   ? path.join("/tmp", "uploads", "daily-reports")
   : path.join(__dirname, "..", "..", "uploads", "daily-reports");
try {
   fs.mkdirSync(uploadDirectory, { recursive: true });
} catch (error) {
   console.error("Upload directory unavailable:", error.message);
}
const upload = multer({
   storage: multer.diskStorage({
      destination: uploadDirectory,
      filename: (req, file, callback) => callback(null, `${Date.now()}-${require("crypto").randomBytes(8).toString("hex")}${path.extname(file.originalname).toLowerCase()}`),
   }),
   limits: { fileSize: 5 * 1024 * 1024, files: 8 },
   fileFilter: (req, file, callback) => {
      const allowed = /^(image\/(jpeg|png|webp)|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/;
      if (!allowed.test(file.mimetype)) return callback(new Error("Only JPG, PNG, WEBP, PDF, and Word files are allowed"));
      callback(null, true);
   },
});

router.get("/", protect, authorize("admin", "project_manager", "site_supervisor"), controller.getAll);
router.get("/files/:fileName", protect, authorize("admin", "project_manager", "site_supervisor"), controller.downloadAttachment);
router.post("/", protect, authorize("admin", "site_supervisor"), (req, res, next) => {
   upload.array("attachments", 8)(req, res, (error) => {
      if (error) return res.status(400).json({ success: false, message: error.message });
      next();
   });
}, controller.create);
router.put("/:id/approve", protect, authorize("admin", "project_manager"), controller.approve);
router.put("/:id/reject", protect, authorize("admin", "project_manager"), controller.reject);

module.exports = router;
