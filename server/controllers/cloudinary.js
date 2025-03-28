import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// 上傳圖片
export const uploadImage = async (req, res) => {
  try {
    // Upload
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: `${process.env.CLOUDINARY_FOLDER}/`,
      resource_type: 'image',
      transformation: [{ quality: "auto", fetch_format: "auto" }]
    });
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 修改圖片
export const modifyImage = async (req, res) => {
  try {
    const { publicId, newImage } = req.body;
    const result = await cloudinary.uploader.upload(newImage, {
      public_id: publicId,
      resource_type: 'image'
    });
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Error modifying image:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 刪除圖片
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    const result = await cloudinary.uploader.destroy(publicId);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};