import express from 'express';
import * as dishController from '../controllers/dish.js';
import { checkAuth } from '../middlewares/auth.js';

const router = express.Router();

// 取得多個餐點
router.get('/:type', dishController.getDishes);

// 取得單個餐點
router.get('/:type/:id', dishController.getDishById);

// 創建新餐點
router.post('/:type', checkAuth, dishController.createDish);

// 更新餐點
router.put('/:type/:id', checkAuth, dishController.updateDish);

// 刪除餐點
router.delete('/:type/:id', checkAuth, dishController.deleteDish);

export default router;