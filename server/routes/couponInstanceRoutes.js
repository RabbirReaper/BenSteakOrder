import express from 'express';
import * as couponInstanceController from '../controllers/couponInstance.js';
import { isCustomer, isSuperAdmin } from '../middlewares/auth.js';

const router = express.Router();

// 獲取客戶的所有優惠券
router.get('/customer/:customerId', isSuperAdmin, couponInstanceController.getCustomerCoupons);

// 獲取當前登入客戶的所有優惠券
router.get('/my-coupons', isCustomer, couponInstanceController.getCurrentCustomerCoupons);

// 獲取單個優惠券
router.get('/:id', couponInstanceController.getCouponById);

// 使用優惠券
router.put('/:id/use', isCustomer, couponInstanceController.useCoupon);

// 購買優惠券
router.post('/purchase', isCustomer, couponInstanceController.purchaseCoupon);

export default router;