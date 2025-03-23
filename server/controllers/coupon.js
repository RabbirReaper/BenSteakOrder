import Coupon from '../models/Orders/Coupon.js';

// 獲取所有優惠券
export const getAllCoupons = async (req, res) => {
  try {
    // 根據有效期限排序，並填充商品資訊
    const coupons = await Coupon.find()
      .sort({ active: -1, expireAt: 1 })
      .populate({
        path: 'items.itemId',
        select: 'name price image',
      });
    
    res.json(coupons);
  } catch (error) {
    console.error('Error getting coupons:', error);
    res.status(500).send('伺服器錯誤');
  }
};

// 獲取單個優惠券
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id).populate({
      path: 'items.itemId',
      select: 'name price image',
    });
    
    if (!coupon) {
      return res.status(404).send('優惠券不存在');
    }
    
    res.json(coupon);
  } catch (error) {
    console.error('Error getting coupon:', error);
    res.status(500).send('伺服器錯誤');
  }
};

// 創建新優惠券
export const createCoupon = async (req, res) => {
  try {
    const { 
      name, 
      type, 
      discount, 
      items, 
      description, 
      active, 
      startAt, 
      expireAt 
    } = req.body;
    
    // 基本驗證
    if (!name || !type) {
      return res.status(400).send('名稱和類型為必填欄位');
    }
    
    // 根據不同類型進行額外驗證
    if (type === 'discount' && (discount === undefined || discount <= 0)) {
      return res.status(400).send('折扣類型必須指定折扣金額');
    }
    
    if (type === 'exchange' && (!items || !items.itemId || !items.itemModel)) {
      return res.status(400).send('兌換類型必須指定商品');
    }
    
    // 創建新優惠券
    const newCoupon = new Coupon({
      name,
      type,
      discount: type === 'discount' ? discount : undefined,
      items: type === 'exchange' ? items : undefined,
      description,
      active: active !== undefined ? active : true,
      startAt: startAt ? new Date(startAt) : undefined,
      expireAt: expireAt ? new Date(expireAt) : undefined
    });
    
    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).send('伺服器錯誤');
  }
};

// 更新優惠券
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      type, 
      discount, 
      items, 
      description, 
      active, 
      startAt, 
      expireAt 
    } = req.body;
    
    // 檢查優惠券是否存在
    const existingCoupon = await Coupon.findById(id);
    if (!existingCoupon) {
      return res.status(404).send('優惠券不存在');
    }
    
    // 更新資料
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (active !== undefined) updateData.active = active;
    if (startAt !== undefined) updateData.startAt = new Date(startAt);
    if (expireAt !== undefined) updateData.expireAt = new Date(expireAt);
    
    // 如果更新類型，需要一併更新相關欄位
    if (type !== undefined) {
      updateData.type = type;
      
      if (type === 'discount') {
        if (discount === undefined || discount <= 0) {
          return res.status(400).send('折扣類型必須指定折扣金額');
        }
        updateData.discount = discount;
        updateData.items = undefined;
      } else if (type === 'exchange') {
        if (!items || !items.itemId || !items.itemModel) {
          return res.status(400).send('兌換類型必須指定商品');
        }
        updateData.items = items;
        updateData.discount = undefined;
      }
    } else {
      // 如果不更新類型，但更新相關欄位
      if (existingCoupon.type === 'discount' && discount !== undefined) {
        updateData.discount = discount;
      } else if (existingCoupon.type === 'exchange' && items !== undefined) {
        updateData.items = items;
      }
    }
    
    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true })
      .populate({
        path: 'items.itemId',
        select: 'name price image',
      });
    
    res.json(updatedCoupon);
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).send('伺服器錯誤');
  }
};

// 刪除優惠券
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await Coupon.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).send('優惠券不存在');
    }
    
    res.send('優惠券已成功刪除');
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).send('伺服器錯誤');
  }
};