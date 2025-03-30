import express from 'express';
import * as dishInstanceController from '../controllers/dishInstance.js';
import { checkAuth } from '../middlewares/auth.js';

const router = express.Router();

// 取得所有餐點實例
router.get('/', checkAuth, dishInstanceController.getAllDishInstances);

// 根據訂單 ID 取得餐點實例
router.get('/order/:orderId', checkAuth, dishInstanceController.getDishInstancesByOrder);

// 取得單個餐點實例
router.get('/:id', checkAuth, dishInstanceController.getDishInstanceById);

// 創建新餐點實例
router.post('/', checkAuth, dishInstanceController.createDishInstance);

// 更新餐點實例
router.put('/:id', checkAuth, dishInstanceController.updateDishInstance);

// 刪除餐點實例
router.delete('/:id', checkAuth, dishInstanceController.deleteDishInstance);

export default router;