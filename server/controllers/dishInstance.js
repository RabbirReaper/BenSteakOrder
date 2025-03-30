import DishInstance from '../models/Dishs/DishInstance.js';
import DishTemplate from '../models/Dishs/DishTemplate.js';
import StockLog from '../models/Stores/StockLog.js';
import mongoose from 'mongoose';

// 取得所有餐點實例
export const getAllDishInstances = async (req, res) => {
  try {
    const instances = await DishInstance.find()
      .populate('templateId')
      .populate('options.category.id')
      .populate('options.selections.id')
      .populate('order');
    
    res.json({
      success: true,
      instances
    });
  } catch (error) {
    console.error('Error getting dish instances:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 根據訂單 ID 取得餐點實例
export const getDishInstancesByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const instances = await DishInstance.find({ order: orderId })
      .populate('templateId')
      .populate('options.category.id')
      .populate('options.selections.id');
    
    res.json({
      success: true,
      instances
    });
  } catch (error) {
    console.error('Error getting dish instances by order:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 取得單個餐點實例
export const getDishInstanceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const instance = await DishInstance.findById(id)
      .populate('templateId')
      .populate('options.category.id')
      .populate('options.selections.id')
      .populate('order');
      
    if (!instance) return res.status(404).json({ success: false, message: '餐點實例不存在' });

    res.json({
      success: true,
      instance
    });
  } catch (error) {
    console.error('Error getting dish instance:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 創建新餐點實例
export const createDishInstance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { templateId, options, specialInstructions, order } = req.body;
    
    // 查找餐點模板
    const template = await DishTemplate.findById(templateId);
    if (!template) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: '餐點模板不存在' });
    }
    
    // 檢查庫存
    if (template.actualStock !== -1 && template.actualStock <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: '餐點已售罄' });
    }
    
    // 計算最終價格
    let finalPrice = template.basePrice;
    if (options && options.length > 0) {
      for (const option of options) {
        if (option.selections && option.selections.length > 0) {
          for (const selection of option.selections) {
            finalPrice += selection.price || 0;
          }
        }
      }
    }
    
    // 創建餐點實例
    const newInstance = new DishInstance({
      templateId,
      name: template.name,
      basePrice: template.basePrice,
      options,
      specialInstructions,
      finalPrice,
      order
    });
    
    await newInstance.save({ session });
    
    // 更新庫存
    if (template.actualStock !== -1) {
      template.actualStock -= 1;
      if (template.displayStock !== -1) {
        template.displayStock = Math.min(template.displayStock, template.actualStock);
      }
      await template.save({ session });
      
      // 創建庫存日誌
      const stockLog = new StockLog({
        dish: template._id,
        dishName: template.name,
        previousStock: template.actualStock + 1,
        newStock: template.actualStock,
        changeAmount: -1,
        changeType: 'order',
        order: order,
        createdAt: new Date()
      });
      
      await stockLog.save({ session });
    }
    
    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: '餐點實例創建成功',
      instance: newInstance
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating dish instance:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 更新餐點實例
export const updateDishInstance = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 檢查餐點實例是否存在
    const instance = await DishInstance.findById(id);
    if (!instance) return res.status(404).json({ success: false, message: '餐點實例不存在' });
    
    // 允許更新的欄位
    const { specialInstructions } = req.body;
    
    if (specialInstructions !== undefined) {
      instance.specialInstructions = specialInstructions;
    }
    
    await instance.save();

    res.json({
      success: true,
      message: '餐點實例更新成功',
      instance
    });
  } catch (error) {
    console.error('Error updating dish instance:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 刪除餐點實例
export const deleteDishInstance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    
    // 找到餐點實例
    const instance = await DishInstance.findById(id);
    if (!instance) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: '餐點實例不存在' });
    }
    
    // 如果需要，恢復庫存
    const template = await DishTemplate.findById(instance.templateId);
    if (template && template.actualStock !== -1) {
      template.actualStock += 1;
      await template.save({ session });
      
      // 創建庫存日誌
      const stockLog = new StockLog({
        dish: template._id,
        dishName: template.name,
        previousStock: template.actualStock - 1,
        newStock: template.actualStock,
        changeAmount: 1,
        changeType: 'system_adjustment',
        reason: '刪除餐點實例',
        createdAt: new Date()
      });
      
      await stockLog.save({ session });
    }
    
    // 刪除餐點實例
    await DishInstance.findByIdAndDelete(id, { session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({
      success: true,
      message: '餐點實例刪除成功'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error deleting dish instance:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};