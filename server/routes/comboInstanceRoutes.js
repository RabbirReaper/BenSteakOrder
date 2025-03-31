import express from 'express';
import * as comboInstanceController from '../controllers/comboInstance.js';
import { checkAuth } from '../middlewares/auth.js';

const router = express.Router();

// 取得所有套餐實例
router.get('/', checkAuth, comboInstanceController.getAllComboInstances);

// 根據訂單 ID 取得套餐實例
router.get('/order/:orderId', checkAuth, comboInstanceController.getComboInstancesByOrder);

// 取得單個套餐實例
router.get('/:id', checkAuth, comboInstanceController.getComboInstanceById);

// 創建新套餐實例
router.post('/', checkAuth, comboInstanceController.createComboInstance);

// 更新套餐實例
router.put('/:id', checkAuth, comboInstanceController.updateComboInstance);

// 刪除套餐實例
router.delete('/:id', checkAuth, comboInstanceController.deleteComboInstance);

export default router;