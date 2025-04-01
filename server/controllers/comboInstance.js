import ComboInstance from '../models/Dishs/ComboInstance.js';
import ComboTemplate from '../models/Dishs/ComboTemplate.js';
import DishTemplate from '../models/Dishs/DishTemplate.js';
import DishInstance from '../models/Dishs/DishInstance.js';
import StockLog from '../models/Stores/StockLog.js';
import mongoose from 'mongoose';

// 取得所有套餐實例
export const getAllComboInstances = async (req, res) => {
  try {
    const instances = await ComboInstance.find()
      .populate('templateId')
      .populate({
        path: 'items.dishInstance',
        populate: { 
          path: 'templateId',
          model: 'DishTemplate' 
        }
      })
      .populate({
        path: 'items.dishTemplate.id',
        model: 'DishTemplate'
      })
      .populate('order');
    
    res.json({
      success: true,
      instances
    });
  } catch (error) {
    console.error('Error getting combo instances:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 根據訂單 ID 取得套餐實例
export const getComboInstancesByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const instances = await ComboInstance.find({ order: orderId })
      .populate('templateId')
      .populate({
        path: 'items.dishInstance',
        populate: { 
          path: 'templateId',
          model: 'DishTemplate' 
        }
      })
      .populate({
        path: 'items.dishTemplate.id',
        model: 'DishTemplate'
      });
    
    res.json({
      success: true,
      instances
    });
  } catch (error) {
    console.error('Error getting combo instances by order:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 取得單個套餐實例
export const getComboInstanceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const instance = await ComboInstance.findById(id)
      .populate('templateId')
      .populate({
        path: 'items.dishInstance',
        populate: { 
          path: 'templateId',
          model: 'DishTemplate' 
        }
      })
      .populate({
        path: 'items.dishTemplate.id',
        model: 'DishTemplate'
      })
      .populate('order');
      
    if (!instance) return res.status(404).json({ success: false, message: '套餐實例不存在' });

    res.json({
      success: true,
      instance
    });
  } catch (error) {
    console.error('Error getting combo instance:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 創建新套餐實例
export const createComboInstance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { templateId, items, specialInstructions, order } = req.body;
    
    // 查找套餐模板
    const template = await ComboTemplate.findById(templateId).session(session);
    if (!template) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: '套餐模板不存在' });
    }
    
    // 檢查庫存
    if (template.actualStock !== -1 && template.actualStock <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: '套餐已售罄' });
    }
    
    // 創建餐點實例
    const processedItems = [];
    let finalPrice = template.basePrice;
    
    for (const item of items) {
      const dishTemplate = await DishTemplate.findById(item.dishTemplate.id).session(session);
      
      if (!dishTemplate) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: `餐點 ${item.dishTemplate.name} 不存在` });
      }
      
      // 計算選項的額外價格
      let optionsPrice = 0;
      if (item.options && item.options.length > 0) {
        for (const option of item.options) {
          if (option.selections && option.selections.length > 0) {
            for (const selection of option.selections) {
              optionsPrice += selection.price || 0;
            }
          }
        }
      }
      
      // 如果需要創建餐點實例
      let dishInstance = null;
      if (item.createInstance) {
        // 創建餐點實例
        const newDishInstance = new DishInstance({
          templateId: dishTemplate._id,
          name: dishTemplate.name,
          basePrice: dishTemplate.basePrice,
          options: item.options || [],
          finalPrice: dishTemplate.basePrice + optionsPrice,
          order
        });
        
        dishInstance = await newDishInstance.save({ session });
        
        // 更新餐點庫存
        if (dishTemplate.actualStock !== -1) {
          dishTemplate.actualStock -= 1;
          if (dishTemplate.displayStock !== -1) {
            dishTemplate.displayStock = Math.min(dishTemplate.displayStock, dishTemplate.actualStock);
          }
          
          await dishTemplate.save({ session });
          
          // 創建庫存日誌
          const stockLog = new StockLog({
            dish: dishTemplate._id,
            dishName: dishTemplate.name,
            previousStock: dishTemplate.actualStock + 1,
            newStock: dishTemplate.actualStock,
            changeAmount: -1,
            changeType: 'order',
            order: order,
            createdAt: new Date()
          });
          
          await stockLog.save({ session });
        }
      }
      
      processedItems.push({
        dishInstance: dishInstance ? dishInstance._id : null,
        dishTemplate: {
          id: dishTemplate._id,
          name: dishTemplate.name
        },
        options: item.options || []
      });
      
      finalPrice += optionsPrice;
    }
    
    // 創建套餐實例
    const newComboInstance = new ComboInstance({
      templateId,
      name: template.name,
      basePrice: template.basePrice,
      items: processedItems,
      specialInstructions,
      finalPrice,
      order
    });
    
    await newComboInstance.save({ session });
    
    // 更新套餐庫存
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
      message: '套餐實例創建成功',
      instance: newComboInstance
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating combo instance:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 更新套餐實例
export const updateComboInstance = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 檢查套餐實例是否存在
    const instance = await ComboInstance.findById(id);
    if (!instance) return res.status(404).json({ success: false, message: '套餐實例不存在' });
    
    // 允許更新的欄位
    const { specialInstructions } = req.body;
    
    if (specialInstructions !== undefined) {
      instance.specialInstructions = specialInstructions;
    }
    
    await instance.save();

    res.json({
      success: true,
      message: '套餐實例更新成功',
      instance
    });
  } catch (error) {
    console.error('Error updating combo instance:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 刪除套餐實例
export const deleteComboInstance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    
    // 找到套餐實例
    const instance = await ComboInstance.findById(id).session(session);
    if (!instance) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: '套餐實例不存在' });
    }
    
    // 如果需要，處理相關的餐點實例和恢復庫存
    if (instance.items && instance.items.length > 0) {
      for (const item of instance.items) {
        if (item.dishInstance) {
          // 刪除相關的餐點實例
          await DishInstance.findByIdAndDelete(item.dishInstance, { session });
        }
      }
    }
    
    // 如果需要，恢復套餐庫存
    const template = await ComboTemplate.findById(instance.templateId).session(session);
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
        reason: '刪除套餐實例',
        createdAt: new Date()
      });
      
      await stockLog.save({ session });
    }
    
    // 刪除套餐實例
    await ComboInstance.findByIdAndDelete(id, { session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({
      success: true,
      message: '套餐實例刪除成功'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error deleting combo instance:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};