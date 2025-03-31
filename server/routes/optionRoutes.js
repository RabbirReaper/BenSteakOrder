import express from 'express';
import * as optionController from '../controllers/option.js';
import { isSuperAdmin } from '../middlewares/auth.js';

const router = express.Router();

// 獲取所有選項
router.get('/', optionController.getAllOptions);

// 獲取單個選項
router.get('/:id', optionController.getOptionById);

// 創建新選項 (需要超級管理員權限)
router.post('/', isSuperAdmin, optionController.createOption);

// 更新選項 (需要超級管理員權限)
router.put('/:id', isSuperAdmin, optionController.updateOption);

// 批量更新選項排序 (需要超級管理員權限)
router.put('/batch/order', isSuperAdmin, optionController.updateOptionsOrder);

// 刪除選項 (需要超級管理員權限)
router.delete('/:id', isSuperAdmin, optionController.deleteOption);

export default router;