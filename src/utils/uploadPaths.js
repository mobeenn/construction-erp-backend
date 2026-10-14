const fs = require("fs");
const path = require("path");

/**
 * Vercel serverless only allows writes under /tmp.
 * Local/dev keeps files under backend/uploads.
 */
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

const PROJECT_ROOT = path.join(__dirname, "..", "..");

function getUploadsRoot() {
   if (isServerless) return path.join("/tmp", "uploads");
   return path.join(PROJECT_ROOT, "uploads");
}

function getUploadDir(...segments) {
   return path.join(getUploadsRoot(), ...segments);
}

function ensureUploadDir(...segments) {
   const dir = getUploadDir(...segments);
   try {
      fs.mkdirSync(dir, { recursive: true });
   } catch (error) {
      console.error(`Upload directory unavailable (${dir}):`, error.message);
   }
   return dir;
}

/**
 * Resolve a stored public URL like `/uploads/documents/file.pdf` to an absolute path.
 */
function resolveUploadUrl(url = "") {
   const relative = String(url).replace(/^\/+/, "");
   if (isServerless && relative.startsWith("uploads/")) {
      return path.join("/tmp", relative);
   }
   return path.join(PROJECT_ROOT, relative);
}

module.exports = {
   isServerless,
   getUploadsRoot,
   getUploadDir,
   ensureUploadDir,
   resolveUploadUrl,
};
