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
