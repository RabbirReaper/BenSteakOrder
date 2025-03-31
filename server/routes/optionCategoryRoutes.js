import express from 'express';
import * as optionCategoryController from '../controllers/optionCategory.js';
import { isSuperAdmin } from '../middlewares/auth.js';

const router = express.Router();

// 獲取所有選項類別
router.get('/', optionCategoryController.getAllOptionCategories);

// 獲取單個選項類別
router.get('/:id', optionCategoryController.getOptionCategoryById);

// 創建新選項類別 (需要超級管理員權限)
router.post('/', isSuperAdmin, optionCategoryController.createOptionCategory);

// 更新選項類別 (需要超級管理員權限)
router.put('/:id', isSuperAdmin, optionCategoryController.updateOptionCategory);

// 刪除選項類別 (需要超級管理員權限)
router.delete('/:id', isSuperAdmin, optionCategoryController.deleteOptionCategory);

export default router;