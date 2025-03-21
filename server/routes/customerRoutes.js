import express from "express";
import * as customerController from '../controllers/customer.js';
import { isCustomer } from '../middlewares/auth.js';

const router = express.Router();

// 客戶登入路由
router.post('/login', customerController.customerLogin);

// 客戶註冊路由
router.post('/register', customerController.customerRegister);

// 檢查電話號碼是否已註冊
router.get('/check-phone/:phoneNumber', customerController.checkPhoneExists);

// 獲取客戶資料（需要客戶登入）
router.get('/profile', isCustomer, customerController.getCustomerProfile);

// 更新客戶資料（需要客戶登入）
router.put('/profile', isCustomer, customerController.updateCustomerProfile);

// 修改密碼（需要客戶登入）
router.put('/change-password', isCustomer, customerController.changePassword);

// 重設密碼（忘記密碼流程）
router.post('/reset-password', customerController.resetPassword);

// 獲取客戶訂單（需要客戶登入）
router.get('/orders', isCustomer, customerController.getCustomerOrders);

export default router;