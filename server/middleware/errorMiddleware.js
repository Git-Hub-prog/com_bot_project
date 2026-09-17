const multer = require("multer");
const mongoose = require("mongoose");
const { ZodError } = require("zod");

const notFound = (req, res) => res.status(404).json({
  success: false,
  message: "Route not found",
});

const validationResponse = (error) => ({
  success: false,
  message: "Validation failed",
  errors: error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
});

const errorHandler = (error, req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";
  const logError = isProduction ? { name: error.name, code: error.code, status: error.status } : error;
  console.error(logError);

  if (res.headersSent) return next(error);
  if (error instanceof ZodError) return res.status(400).json(validationResponse(error));
  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE" ? "Uploaded file is too large" : "Invalid multipart upload";
    return res.status(400).json({ success: false, message });
  }
  if (error.type === "entity.too.large") return res.status(413).json({ success: false, message: "Request body is too large" });
  if (error instanceof mongoose.Error.ValidationError) return res.status(400).json({ success: false, message: "Request data is invalid" });
  if (error instanceof mongoose.Error.CastError) return res.status(400).json({ success: false, message: "Invalid resource identifier" });
  if (error.code === 11000) return res.status(409).json({ success: false, message: "A resource with these details already exists" });

  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 500;
  const message = status < 500 && error.message ? error.message : "Internal server error";
  return res.status(status).json({ success: false, message });
};

module.exports = { notFound, errorHandler };
