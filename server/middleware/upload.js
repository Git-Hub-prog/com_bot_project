const multer = require("multer");
const path = require("path");
const { UPLOAD_MAX_SIZE_MB } = require("../config/env");

const allowedImages = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_MAX_SIZE_MB * 1024 * 1024, fields: 20, fieldSize: 16 * 1024 },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    if (!allowedImages[extension] || allowedImages[extension] !== file.mimetype) {
      const error = new Error("Only JPG, JPEG, PNG, and WebP images are supported");
      error.status = 400;
      return callback(error);
    }
    return callback(null, true);
  },
});

const imageToDataUrl = (file) => {
  if (!file) return "";
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};

const hasValidImageSignature = (file) => {
  if (!file?.buffer) return false;
  const bytes = file.buffer;
  const extension = path.extname(file.originalname || "").toLowerCase();
  if ((extension === ".jpg" || extension === ".jpeg") && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;
  if (extension === ".png" && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return true;
  if (extension === ".webp" && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return true;
  return false;
};

module.exports = { upload, imageToDataUrl, hasValidImageSignature };
