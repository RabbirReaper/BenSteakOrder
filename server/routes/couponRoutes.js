import express from 'express';
import * as couponController from '../controllers/coupon.js';
import { isSuperAdmin } from '../middlewares/auth.js';

const router = express.Router();

// 獲取所有優惠券
router.get('/', couponController.getAllCoupons);

// 獲取單個優惠券
router.get('/:id', couponController.getCouponById);

// 創建新優惠券
router.post('/', isSuperAdmin, couponController.createCoupon);

// 更新優惠券
router.put('/:id', isSuperAdmin, couponController.updateCoupon);

// 刪除優惠券
router.delete('/:id', isSuperAdmin, couponController.deleteCoupon);

export default router;