import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config()

// Configuration 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const router = express.Router();  

// Upload an image
router.post('/', async (req, res) => {
  try {
    // Upload
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: 'beefpicture',
      resource_type: 'image',
      transformation: [{ quality: "auto", fetch_format: "auto" }]
    });
    
    
    // console.log("Success! Image uploaded.");
    // console.log("- Public ID:", result.public_id);
    // console.log("- URL:", result.secure_url);
    res.json(result);
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).send('Internal server error');
  }
});

// modify an image
router.put('/', async (req, res) => {
  try {
    const { publicId, newImage } = req.body;
    const result = await cloudinary.uploader.upload(newImage, {
      public_id: publicId,
      resource_type: 'image'
    });
    // console.log("Image modified:", result);
    res.json(result);
  } catch (error) {
    console.error("Error modifying image:", error);
    res.status(500).send('Internal server error');
  }
});



// Delete an image
router.delete('/', async (req, res) => {
  // console.log(req.body)
  try {
    const { publicId } = req.body;
    const result = await cloudinary.uploader.destroy(publicId);
    // console.log("Image deleted:", result);
    res.json(result);
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).send('Internal server error');
  }
});


export default router;
