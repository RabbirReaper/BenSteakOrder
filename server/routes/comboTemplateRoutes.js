import express from 'express';
import * as comboTemplateController from '../controllers/comboTemplate.js';
import { isSuperAdmin } from '../middlewares/auth.js';

const router = express.Router();

// 獲取所有套餐模板
router.get('/', comboTemplateController.getAllComboTemplates);

// 獲取單個套餐模板
router.get('/:id', comboTemplateController.getComboTemplateById);

// 創建新套餐模板 (需要超級管理員權限)
router.post('/', isSuperAdmin, comboTemplateController.createComboTemplate);

// 更新套餐模板 (需要超級管理員權限)
router.put('/:id', isSuperAdmin, comboTemplateController.updateComboTemplate);

// 更新套餐庫存 (需要超級管理員權限)
router.put('/:id/stock', isSuperAdmin, comboTemplateController.updateComboStock);

// 刪除套餐模板 (需要超級管理員權限)
router.delete('/:id', isSuperAdmin, comboTemplateController.deleteComboTemplate);

export default router;