import express from "express";
import * as authController from '../controllers/auth.js';
import { checkAuth } from '../middlewares/auth.js';

const router = express.Router();

// 登入路由
router.post('/login', authController.login);

// 登出路由
router.post('/logout', authController.logout);

// 獲取當前用戶信息
router.get('/current_user', authController.getCurrentUser);

// 創建新管理員（需驗證）
router.post('/createUser', checkAuth, authController.createUser);

// 刪除管理員（需驗證）
router.delete('/deleteUser/:id', checkAuth, authController.deleteUser);

export default router;