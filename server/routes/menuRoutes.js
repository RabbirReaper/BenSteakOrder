import express from 'express';
import * as menuController from '../controllers/menu.js';
import { checkAuth } from '../middlewares/auth.js';

const router = express.Router();

// 獲取所有菜單
router.get('/', menuController.getAllMenus);

// 獲取單個菜單
router.get('/:id', menuController.getMenuById);

// 創建菜單 (需要驗證)
router.post('/', checkAuth, menuController.createMenu);

// 更新菜單 (需要驗證)
router.put('/:id', checkAuth, menuController.updateMenu);

// 刪除菜單 (需要驗證)
router.delete('/:id', checkAuth, menuController.deleteMenu);

export default router;