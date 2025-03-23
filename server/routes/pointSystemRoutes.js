import express from 'express';
import * as pointSystemController from '../controllers/pointSystem.js';
import { isSuperAdmin } from '../middlewares/auth.js';

const router = express.Router();

// 獲取所有點數系統設定
router.get('/', pointSystemController.getAllPointSystems);

// 獲取單個點數系統設定
router.get('/:id', pointSystemController.getPointSystemById);

// 新增點數系統設定
router.post('/', isSuperAdmin, pointSystemController.createPointSystem);

// 更新點數系統設定
router.put('/:id', isSuperAdmin, pointSystemController.updatePointSystem);

// 刪除點數系統設定
router.delete('/:id', isSuperAdmin, pointSystemController.deletePointSystem);

export default router;