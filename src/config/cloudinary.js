require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { CustomError } = require("../utilities/CustomError");
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRECT,
});

// Upload Image
exports.uploadImage = async (filePath) => {
  try {
    if (!filePath && !fs.existsSync(filePath)) {
      throw new CustomError(400, "File path is required");
    }

    const uploadedImage = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      quality: "auto",
    });

    if (uploadedImage) {
      fs.unlinkSync(filePath);
      return { public_id: uploadedImage.public_id, url: uploadedImage.url };
    }
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.log("Error from Cloudinary upload", error);
    throw new CustomError(500, "Cloudinary upload failed: " + error.message);
  }
};

// Delete Image
exports.deleteImage = async (public_id) => {
  try {
    if (!public_id) throw new CustomError(400, "Public id is required");
    const deleted = await cloudinary.uploader.destroy(public_id);
    if (deleted) return true;
  } catch (error) {
    console.log("Error deleting image:", error.message);
    throw new CustomError(500, "Failed to delete image: " + error.message);
  }
};