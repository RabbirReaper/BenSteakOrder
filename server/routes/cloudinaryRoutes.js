import express from 'express';
import * as cloudinaryController from '../controllers/cloudinary.js';

const router = express.Router();  

// 上傳圖片
router.post('/', cloudinaryController.uploadImage);

// 修改圖片
router.put('/', cloudinaryController.modifyImage);

// 刪除圖片
router.delete('/', cloudinaryController.deleteImage);

export default router;