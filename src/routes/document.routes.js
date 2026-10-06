const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const {
   upload,
   create,
   getAll,
   getByEntity,
   getById,
   update,
   download,
   remove,
   hardDelete,
} = require("../controllers/documents/document.controller");

// Configure multer storage (Vercel only allows writes under /tmp)
const uploadDirectory = process.env.VERCEL
   ? path.join("/tmp", "uploads", "documents")
   : path.join(__dirname, "..", "..", "uploads", "documents");
try {
   if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory, { recursive: true });
   }
} catch (error) {
   console.error("Upload directory unavailable:", error.message);
}

const storage = multer.diskStorage({
   destination: uploadDirectory,
   filename: (req, file, callback) => {
      const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${path.extname(file.originalname).toLowerCase()}`;
      callback(null, uniqueName);
   },
});

const uploadMiddleware = multer({
   storage,
   limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
   fileFilter: (req, file, callback) => {
      const allowed = /^(image\/(jpeg|png|webp|gif)|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|text\/plain)$/;
      if (!allowed.test(file.mimetype)) {
         return callback(new Error("File type not allowed. Allowed: JPG, PNG, WEBP, GIF, PDF, Word, Excel, TXT"));
      }
      callback(null, true);
   },
});

// Document routes
router.get("/", protect, getAll);
router.get("/entity/:entityType/:entityId", protect, getByEntity);
router.get("/:id", protect, getById);
router.get("/:id/download", protect, download);
router.post("/", protect, uploadMiddleware.single("file"), upload);
router.post("/without-file", protect, create);
router.put("/:id", protect, update);
router.delete("/:id", protect, authorize("admin"), remove);
router.delete("/:id/permanent", protect, authorize("admin"), hardDelete);

module.exports = router;
