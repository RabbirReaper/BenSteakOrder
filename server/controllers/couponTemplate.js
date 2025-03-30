import CouponTemplate from '../models/Promotions/CouponTemplate.js';
import CouponInstance from '../models/Promotions/CouponInstance.js';
import Customer from '../models/Users/Customer.js';

// 獲取所有優惠券模板
export const getAllCouponTemplates = async (req, res) => {
  try {
    const templates = await CouponTemplate.find().sort({ active: -1, createdAt: -1 });
    
    // 填充兌換商品或適用商品的詳細信息
    const populatedTemplates = await Promise.all(templates.map(async (template) => {
      const templateObj = template.toObject();
      
      // 如果是兌換券
      if (template.type === 'exchange' && template.exchangeItem) {
        try {
          const Model = await import(`../models/${template.exchangeItem.itemModel}.js`);
          const item = await Model.default.findById(template.exchangeItem.itemId);
          if (item) {
            templateObj.exchangeItemDetails = item;
          }
        } catch (err) {
          console.error(`Error loading model: ${template.exchangeItem.itemModel}`, err);
        }
      }
      
      // 如果是折扣券且有適用商品
      if (template.type === 'discount' && template.admitItems && template.admitItems.length > 0) {
        const itemDetails = [];
        
        for (const admitItem of template.admitItems) {
          try {
            const Model = await import(`../models/${admitItem.itemModel}.js`);
            const item = await Model.default.findById(admitItem.itemId);
            if (item) {
              itemDetails.push({
                ...admitItem,
                details: item
              });
            }
          } catch (err) {
            console.error(`Error loading model: ${admitItem.itemModel}`, err);
          }
        }
        
        templateObj.admitItemsDetails = itemDetails;
      }
      
      return templateObj;
    }));
    
    res.json({
      success: true,
      templates: populatedTemplates
    });
  } catch (error) {
    console.error('Error getting coupon templates:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 獲取單個優惠券模板
export const getCouponTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await CouponTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({ success: false, message: '優惠券模板不存在' });
    }
    
    // 轉換為普通對象以便添加額外信息
    const templateObj = template.toObject();
    
    // 如果是兌換券
    if (template.type === 'exchange' && template.exchangeItem) {
      try {
        const Model = await import(`../models/${template.exchangeItem.itemModel}.js`);
        const item = await Model.default.findById(template.exchangeItem.itemId);
        if (item) {
          templateObj.exchangeItemDetails = item;
        }
      } catch (err) {
        console.error(`Error loading model: ${template.exchangeItem.itemModel}`, err);
      }
    }
    
    // 如果是折扣券且有適用商品
    if (template.type === 'discount' && template.admitItems && template.admitItems.length > 0) {
      const itemDetails = [];
      
      for (const admitItem of template.admitItems) {
        try {
          const Model = await import(`../models/${admitItem.itemModel}.js`);
          const item = await Model.default.findById(admitItem.itemId);
          if (item) {
            itemDetails.push({
              ...admitItem,
              details: item
            });
          }
        } catch (err) {
          console.error(`Error loading model: ${admitItem.itemModel}`, err);
        }
      }
      
      templateObj.admitItemsDetails = itemDetails;
    }
    
    // 獲取已發出的優惠券數量
    const issuedCount = await CouponInstance.countDocuments({ templateId: template._id });
    templateObj.issuedCount = issuedCount;
    
    res.json({
      success: true,
      template: templateObj
    });
  } catch (error) {
    console.error('Error getting coupon template:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 創建優惠券模板
export const createCouponTemplate = async (req, res) => {
  try {
    const {
      name,
      type,
      discount,
      exchangeItem,
      admitItems,
      description,
      price,
      active,
      startAt,
      endAt,
      stock,
      limitPerCustomer
    } = req.body;
    
    // 基本驗證
    if (!name || !type) {
      return res.status(400).json({ success: false, message: '名稱和類型為必填欄位' });
    }
    
    // 根據類型驗證必填欄位
    if (type === 'discount' && (discount === undefined || discount <= 0)) {
      return res.status(400).json({ success: false, message: '折扣金額必須大於 0' });
    }
    
    if (type === 'exchange' && (!exchangeItem || !exchangeItem.itemModel || !exchangeItem.itemId)) {
      return res.status(400).json({ success: false, message: '兌換商品資訊不完整' });
    }
    
    // 創建新模板
    const newTemplate = new CouponTemplate({
      name,
      type,
      discount: type === 'discount' ? discount : undefined,
      exchangeItem: type === 'exchange' ? exchangeItem : undefined,
      admitItems: type === 'discount' ? admitItems : undefined,
      description,
      price: price || 0,
      active: active || false,
      startAt: startAt ? new Date(startAt) : undefined,
      endAt: endAt ? new Date(endAt) : undefined,
      stock: stock !== undefined ? stock : -1,
      limitPerCustomer: limitPerCustomer !== undefined ? limitPerCustomer : -1
    });
    
    await newTemplate.save();
    
    res.status(201).json({
      success: true,
      message: '優惠券模板創建成功',
      template: newTemplate
    });
  } catch (error) {
    console.error('Error creating coupon template:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 更新優惠券模板
export const updateCouponTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      active,
      startAt,
      endAt,
      stock,
      limitPerCustomer
    } = req.body;
    
    // 找到模板
    const template = await CouponTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ success: false, message: '優惠券模板不存在' });
    }
    
    // 僅允許更新部分欄位，不允許更改優惠券的核心屬性
    if (name !== undefined) template.name = name;
    if (description !== undefined) template.description = description;
    if (price !== undefined) template.price = price;
    if (active !== undefined) template.active = active;
    if (startAt !== undefined) template.startAt = new Date(startAt);
    if (endAt !== undefined) template.endAt = new Date(endAt);
    if (stock !== undefined) template.stock = stock;
    if (limitPerCustomer !== undefined) template.limitPerCustomer = limitPerCustomer;
    
    await template.save();
    
    res.json({
      success: true,
      message: '優惠券模板更新成功',
      template
    });
  } catch (error) {
    console.error('Error updating coupon template:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 刪除優惠券模板
export const deleteCouponTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 檢查是否有已發出的優惠券
    const couponCount = await CouponInstance.countDocuments({ templateId: id });
    if (couponCount > 0) {
      return res.status(400).json({ success: false, message: '無法刪除已有優惠券發出的模板' });
    }
    
    const template = await CouponTemplate.findByIdAndDelete(id);
    if (!template) {
      return res.status(404).json({ success: false, message: '優惠券模板不存在' });
    }
    
    res.json({
      success: true,
      message: '優惠券模板刪除成功'
    });
  } catch (error) {
    console.error('Error deleting coupon template:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 發放優惠券給特定客戶
export const issueCouponToCustomer = async (req, res) => {
  try {
    const { templateId, customerId, acquisitionMethod } = req.body;
    
    // 驗證必要數據
    if (!templateId || !customerId) {
      return res.status(400).json({ success: false, message: '優惠券模板ID和客戶ID為必填欄位' });
    }
    
    // 檢查模板是否存在
    const template = await CouponTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: '優惠券模板不存在' });
    }
    
    // 檢查客戶是否存在
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: '客戶不存在' });
    }
    
    // 檢查庫存
    if (template.stock !== -1 && template.stock <= 0) {
      return res.status(400).json({ success: false, message: '優惠券已無庫存' });
    }
    
    // 檢查每人限制
    if (template.limitPerCustomer !== -1) {
      const customerCouponCount = await CouponInstance.countDocuments({
        templateId,
        owner: customerId,
        isUsed: false
      });
      
      if (customerCouponCount >= template.limitPerCustomer) {
        return res.status(400).json({ success: false, message: '已達到每人限制數量' });
      }
    }
    
    // 設置有效期
    const now = new Date();
    let startAt = template.startAt ? new Date(template.startAt) : now;
    let expireAt = template.endAt ? new Date(template.endAt) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 默認30天有效期
    
    // 如果沒有設置開始日期，或者開始日期已過，則使用當前時間作為開始日期
    if (!template.startAt || startAt < now) {
      startAt = now;
    }
    
    // 創建客戶優惠券實例
    const couponInstance = new CouponInstance({
      templateId: template._id,
      name: template.name,
      type: template.type,
      discount: template.type === 'discount' ? template.discount : undefined,
      exchangeItem: template.type === 'exchange' ? template.exchangeItem : undefined,
      startAt,
      expireAt,
      owner: customer._id,
      acquisitionMethod: acquisitionMethod || 'activity'
    });
    
    await couponInstance.save();
    
    // 更新庫存
    if (template.stock !== -1) {
      template.stock -= 1;
      await template.save();
    }
    
    res.status(201).json({
      success: true,
      message: '優惠券發放成功',
      coupon: couponInstance
    });
  } catch (error) {
    console.error('Error issuing coupon:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};