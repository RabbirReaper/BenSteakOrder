// server/routes/dishRoutes.js
import express from 'express';
import * as dishController from '../controllers/dish.js';
import { isSuperAdmin } from '../middlewares/auth.js';

const router = express.Router();

// 取得所有餐點
router.get('/', dishController.getDishes);

// 取得單個餐點
router.get('/:id', dishController.getDishById);

// 創建新餐點
router.post('/', isSuperAdmin, dishController.createDish);

// 更新餐點
router.put('/:id', isSuperAdmin, dishController.updateDish);

// 刪除餐點
router.delete('/:id', isSuperAdmin, dishController.deleteDish);

export default router;