import express from 'express';
import * as comboController from '../controllers/combo.js';
import { isSuperAdmin } from '../middlewares/auth.js';

const router = express.Router();

// 獲取所有套餐
router.get('/', comboController.getAllCombos);

// 獲取單個套餐
router.get('/:id', comboController.getComboById);

// 創建新套餐 (需要超級管理員權限)
router.post('/', isSuperAdmin, comboController.createCombo);

// 更新套餐 (需要超級管理員權限)
router.put('/:id', isSuperAdmin, comboController.updateCombo);

// 刪除套餐 (需要超級管理員權限)
router.delete('/:id', isSuperAdmin, comboController.deleteCombo);

export default router;