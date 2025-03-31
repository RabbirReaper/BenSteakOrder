import CouponInstance from '../models/Promotions/CouponInstance.js';
import Customer from '../models/Users/Customer.js';
import mongoose from 'mongoose';

// 獲取客戶的所有優惠券
export const getCustomerCoupons = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // 驗證客戶是否存在
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: '客戶不存在' });
    }
    
    // 查詢客戶的所有優惠券
    const coupons = await CouponInstance.find({ owner: customerId })
      .populate('templateId')
      .sort({ isUsed: 1, expireAt: 1 }); // 未使用的和即將過期的排在前面
    
    // 處理特殊引用（兌換券的商品）
    const enrichedCoupons = await Promise.all(coupons.map(async (coupon) => {
      const couponObj = coupon.toObject();
      
      // 如果是兌換券，獲取兌換商品的詳細信息
      if (coupon.type === 'exchange' && coupon.exchangeItem) {
        try {
          const { itemModel, itemId } = coupon.exchangeItem;
          const Model = mongoose.model(itemModel);
          const item = await Model.findById(itemId);
          if (item) {
            couponObj.exchangeItemDetails = item.toObject();
          }
        } catch (err) {
          console.error('Error loading exchange item details:', err);
        }
      }
      
      return couponObj;
    }));
    
    res.json({
      success: true,
      coupons: enrichedCoupons
    });
  } catch (error) {
    console.error('Error getting customer coupons:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 獲取目前登入客戶的所有優惠券
export const getCurrentCustomerCoupons = async (req, res) => {
  try {
    if (!req.session.customer_id) {
      return res.status(401).json({ success: false, message: '請先登入' });
    }
    
    const customerId = req.session.customer_id;
    
    // 查詢客戶的所有優惠券
    const coupons = await CouponInstance.find({ 
      owner: customerId,
      isUsed: false,
      expireAt: { $gt: new Date() } // 只返回未過期的優惠券
    })
    .populate('templateId')
    .sort({ expireAt: 1 }); // 即將過期的排在前面
    
    // 處理特殊引用（兌換券的商品）
    const enrichedCoupons = await Promise.all(coupons.map(async (coupon) => {
      const couponObj = coupon.toObject();
      
      // 如果是兌換券，獲取兌換商品的詳細信息
      if (coupon.type === 'exchange' && coupon.exchangeItem) {
        try {
          const { itemModel, itemId } = coupon.exchangeItem;
          const Model = mongoose.model(itemModel);
          const item = await Model.findById(itemId);
          if (item) {
            couponObj.exchangeItemDetails = item.toObject();
          }
        } catch (err) {
          console.error('Error loading exchange item details:', err);
        }
      }
      
      return couponObj;
    }));
    
    res.json({
      success: true,
      coupons: enrichedCoupons
    });
  } catch (error) {
    console.error('Error getting current customer coupons:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 獲取單個優惠券
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await CouponInstance.findById(id).populate('templateId');
    if (!coupon) {
      return res.status(404).json({ success: false, message: '優惠券不存在' });
    }
    
    // 檢查權限（只能查看自己的優惠券）
    if (req.session.customer_id && coupon.owner.toString() !== req.session.customer_id.toString()) {
      return res.status(403).json({ success: false, message: '沒有權限查看此優惠券' });
    }
    
    // 處理兌換商品詳細信息
    const couponObj = coupon.toObject();
    if (coupon.type === 'exchange' && coupon.exchangeItem) {
      try {
        const { itemModel, itemId } = coupon.exchangeItem;
        const Model = mongoose.model(itemModel);
        const item = await Model.findById(itemId);
        if (item) {
          couponObj.exchangeItemDetails = item.toObject();
        }
      } catch (err) {
        console.error('Error loading exchange item details:', err);
      }
    }
    
    res.json({
      success: true,
      coupon: couponObj
    });
  } catch (error) {
    console.error('Error getting coupon:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 使用優惠券
export const useCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderId } = req.body;
    
    // 檢查優惠券是否存在
    const coupon = await CouponInstance.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: '優惠券不存在' });
    }
    
    // 檢查是否已經使用
    if (coupon.isUsed) {
      return res.status(400).json({ success: false, message: '優惠券已使用' });
    }
    
    // 檢查是否過期
    if (coupon.expireAt < new Date()) {
      return res.status(400).json({ success: false, message: '優惠券已過期' });
    }
    
    // 檢查權限（只能使用自己的優惠券）
    if (req.session.customer_id && coupon.owner.toString() !== req.session.customer_id.toString()) {
      return res.status(403).json({ success: false, message: '沒有權限使用此優惠券' });
    }
    
    // 標記為已使用
    coupon.isUsed = true;
    coupon.usedAt = new Date();
    coupon.usedOrder = orderId;
    
    await coupon.save();
    
    res.json({
      success: true,
      message: '優惠券已成功使用',
      coupon
    });
  } catch (error) {
    console.error('Error using coupon:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 購買優惠券
export const purchaseCoupon = async (req, res) => {
  try {
    const { templateId } = req.body;
    
    // 檢查客戶是否登入
    if (!req.session.customer_id) {
      return res.status(401).json({ success: false, message: '請先登入' });
    }
    
    const customerId = req.session.customer_id;
    
    // 檢查模板是否存在
    const CouponTemplate = mongoose.model('CouponTemplate');
    const template = await CouponTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: '優惠券模板不存在' });
    }
    
    // 檢查是否上架中
    if (!template.active) {
      return res.status(400).json({ success: false, message: '優惠券未上架' });
    }
    
    // 檢查是否在有效期內
    const now = new Date();
    if (template.startAt && template.startAt > now) {
      return res.status(400).json({ success: false, message: '優惠券尚未開始販售' });
    }
    
    if (template.endAt && template.endAt < now) {
      return res.status(400).json({ success: false, message: '優惠券已停止販售' });
    }
    
    // 檢查庫存
    if (template.stock !== -1 && template.stock <= 0) {
      return res.status(400).json({ success: false, message: '優惠券已售罄' });
    }
    
    // 創建優惠券實例
    const startAt = template.startAt ? new Date(template.startAt) : now;
    let expireAt = template.endAt ? new Date(template.endAt) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 默認30天有效期
    
    const couponInstance = new CouponInstance({
      templateId: template._id,
      name: template.name,
      type: template.type,
      discount: template.type === 'discount' ? template.discount : undefined,
      exchangeItem: template.type === 'exchange' ? template.exchangeItem : undefined,
      startAt,
      expireAt,
      owner: customerId,
      acquisitionMethod: 'purchase'
    });
    
    await couponInstance.save();
    
    // 更新庫存
    if (template.stock !== -1) {
      template.stock -= 1;
      await template.save();
    }
    
    // 這裡應該有處理付款邏輯，但為簡化起見省略
    
    res.status(201).json({
      success: true,
      message: '優惠券購買成功',
      coupon: couponInstance
    });
  } catch (error) {
    console.error('Error purchasing coupon:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};