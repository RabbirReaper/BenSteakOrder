// server/routes/stockLogRoutes.js
import express from 'express';
import * as stockLogController from '../controllers/stockLog.js';
import { isSuperAdmin } from '../middlewares/auth.js';

const router = express.Router();

// 獲取特定餐點的庫存日誌
router.get('/dish/:dishId', isSuperAdmin, stockLogController.getStockLogsByDish);

// 獲取所有庫存日誌
router.get('/', isSuperAdmin, stockLogController.getAllStockLogs);

// 手動調整庫存
router.post('/adjust', isSuperAdmin, stockLogController.adjustStock);

// 初始化餐點庫存
router.post('/initialize', isSuperAdmin, stockLogController.initializeStock);

export default router;