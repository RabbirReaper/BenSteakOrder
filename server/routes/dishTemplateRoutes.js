import express from 'express';
import * as dishTemplateController from '../controllers/dishTemplate.js';
import { isSuperAdmin } from '../middlewares/auth.js';

const router = express.Router();

// 取得所有餐點模板
router.get('/', dishTemplateController.getAllDishTemplates);

// 取得單個餐點模板
router.get('/:id', dishTemplateController.getDishTemplateById);

// 創建新餐點模板 (需要驗證)
router.post('/', isSuperAdmin, dishTemplateController.createDishTemplate);

// 更新餐點模板 (需要驗證)
router.put('/:id', isSuperAdmin, dishTemplateController.updateDishTemplate);

// 更新餐點庫存 (需要驗證)
router.put('/:id/stock', isSuperAdmin, dishTemplateController.updateDishStock);

// 刪除餐點模板 (需要驗證)
router.delete('/:id', isSuperAdmin, dishTemplateController.deleteDishTemplate);

export default router;