import express from 'express';
import * as couponTemplateController from '../controllers/couponTemplate.js';
import { isSuperAdmin } from '../middlewares/auth.js';

const router = express.Router();

// 獲取所有優惠券模板
router.get('/', couponTemplateController.getAllCouponTemplates);

// 獲取單個優惠券模板
router.get('/:id', couponTemplateController.getCouponTemplateById);

// 創建優惠券模板 (需要驗證)
router.post('/', isSuperAdmin, couponTemplateController.createCouponTemplate);

// 更新優惠券模板 (需要驗證)
router.put('/:id', isSuperAdmin, couponTemplateController.updateCouponTemplate);

// 刪除優惠券模板 (需要驗證)
router.delete('/:id', isSuperAdmin, couponTemplateController.deleteCouponTemplate);

export default router;