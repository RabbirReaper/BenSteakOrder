import express from "express";
import * as authController from '../controllers/auth.js';
import { isSuperAdmin } from '../middlewares/auth.js';

const router = express.Router();

// 管理員登入路由
router.post('/admin/login', authController.authLogin);

// 登出路由
router.post('/logout', authController.logout);

// 獲取當前用戶信息
router.get('/current_user', authController.getCurrentUser);

// 創建新管理員（需驗證）
router.post('/createAdmin', isSuperAdmin, authController.createAdmin);

// 刪除管理員（需驗證）
router.delete('/deleteUser/:id', isSuperAdmin, authController.deleteUser);

export default router;