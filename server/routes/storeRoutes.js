import express from 'express';
import * as storeController from '../controllers/store.js';
import { isSuperAdmin } from '../middlewares/auth.js';

const router = express.Router();

// 獲取所有店家
router.get('/', storeController.getAllStores);

// 獲取單個店家
router.get('/:id', storeController.getStoreById);

// 創建店家 (需要驗證)
router.post('/', isSuperAdmin, storeController.createStore);

// 更新店家 (需要驗證)
router.put('/:id', isSuperAdmin, storeController.updateStore);

// 刪除店家 (需要驗證)
router.delete('/:id', isSuperAdmin, storeController.deleteStore);

export default router;