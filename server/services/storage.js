const { hasValidImageSignature, imageToDataUrl } = require("../middleware/upload");

const storeImage = async (file) => {
  if (!file) return "";
  if (!hasValidImageSignature(file)) {
    const error = new Error("Uploaded file content does not match a supported image format");
    error.status = 400;
    throw error;
  }
  return imageToDataUrl(file);
};

module.exports = { storeImage };