import ComboTemplate from '../models/Dishs/ComboTemplate.js';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

// 獲取所有套餐模板
export const getAllComboTemplates = async (req, res) => {
  try {
    const templates = await ComboTemplate.find()
      .populate({
        path: 'dishes.dish',
        model: 'DishTemplate'
      })
      .populate({
        path: 'dishes.options',
        model: 'Option',
        populate: {
          path: 'category',
          model: 'OptionCategory'
        }
      })
      .sort({ basePrice: 1 });
    
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error getting combo templates:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 獲取單個套餐模板
export const getComboTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await ComboTemplate.findById(id)
      .populate({
        path: 'dishes.dish',
        model: 'DishTemplate'
      })
      .populate({
        path: 'dishes.options',
        model: 'Option',
        populate: {
          path: 'category',
          model: 'OptionCategory'
        }
      });
    
    if (!template) {
      return res.status(404).json({ success: false, message: '套餐模板不存在' });
    }
    
    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Error getting combo template:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 創建新套餐模板
export const createComboTemplate = async (req, res) => {
  try {
    const { name, dishes, basePrice, description, image, isAvailable, actualStock, displayStock } = req.body;
    
    // 基本驗證
    if (!name || !basePrice || !Array.isArray(dishes) || dishes.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '名稱、餐點和套餐價格為必填欄位' 
      });
    }
    
    // 創建新套餐模板
    const newTemplate = new ComboTemplate({
      name,
      dishes,
      basePrice,
      description,
      image,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      actualStock: actualStock !== undefined ? actualStock : -1,
      displayStock: displayStock !== undefined ? displayStock : -1
    });
    
    await newTemplate.save();
    
    res.status(201).json({
      success: true,
      message: '套餐模板創建成功',
      template: newTemplate
    });
  } catch (error) {
    console.error('Error creating combo template:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 更新套餐模板
export const updateComboTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dishes, basePrice, description, image, isAvailable } = req.body;
    
    // 基本驗證
    if (!name || !basePrice || !Array.isArray(dishes) || dishes.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '名稱、餐點和套餐價格為必填欄位' 
      });
    }
    
    // 檢查套餐模板是否存在
    const template = await ComboTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ success: false, message: '套餐模板不存在' });
    }
    
    // 準備更新資料
    const updateData = {
      name,
      dishes,
      basePrice,
      description,
      isAvailable: isAvailable !== undefined ? isAvailable : template.isAvailable
    };
    
    // 如果有新圖片，更新圖片
    if (image && image !== template.image) {
      updateData.image = image;
    }
    
    // 更新套餐模板
    const updatedTemplate = await ComboTemplate.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    res.json({
      success: true,
      message: '套餐模板更新成功',
      template: updatedTemplate
    });
  } catch (error) {
    console.error('Error updating combo template:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 更新套餐庫存
export const updateComboStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualStock, displayStock, reason } = req.body;
    
    // 檢查套餐模板是否存在
    const template = await ComboTemplate.findById(id);
    if (!template) return res.status(404).json({ success: false, message: '套餐模板不存在' });
    
    // 記錄原始庫存，用於庫存日誌
    const previousStock = template.actualStock;
    
    // 更新庫存
    if (actualStock !== undefined) {
      template.actualStock = actualStock;
    }
    
    if (displayStock !== undefined) {
      // 確保顯示庫存不大於實際庫存
      if (template.actualStock !== -1 && displayStock > template.actualStock) {
        return res.status(400).json({ 
          success: false, 
          message: '顯示庫存不能大於實際庫存' 
        });
      }
      template.displayStock = displayStock;
    }
    
    await template.save();
    
    // 創建庫存變動日誌 (如果需要的話)
    if (actualStock !== undefined && actualStock !== previousStock) {
      const StockLog = mongoose.model('StockLog');
      await new StockLog({
        dish: template._id, // 使用 combo template ID
        dishName: template.name,
        previousStock,
        newStock: actualStock,
        changeAmount: actualStock - previousStock,
        changeType: actualStock > previousStock ? 'manual_add' : 'manual_subtract',
        reason: reason || '管理員手動調整',
        admin: req.session.user_id
      }).save();
    }

    res.json({
      success: true,
      message: '庫存更新成功',
      template
    });
  } catch (error) {
    console.error('Error updating combo stock:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 刪除套餐模板
export const deleteComboTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 檢查套餐模板是否存在
    const template = await ComboTemplate.findById(id);
    if (!template) {
      return res.status(404).json({ success: false, message: '套餐模板不存在' });
    }
    
    // 檢查是否有關聯的套餐實例
    const ComboInstance = mongoose.model('ComboInstance');
    const instanceCount = await ComboInstance.countDocuments({ templateId: id });
    
    if (instanceCount > 0) {
      return res.status(400).json({
        success: false,
        message: '此套餐模板已有相關訂單，無法刪除'
      });
    }
    
    // 如果有圖片，先刪除雲端上的圖片
    if (template.image && template.image.publicId) {
      try {
        await cloudinary.uploader.destroy(template.image.publicId);
      } catch (cloudinaryError) {
        console.error("刪除雲端圖片時發生錯誤:", cloudinaryError);
        // 即使刪除圖片失敗，仍然繼續刪除套餐模板資料
      }
    }
    
    // 刪除套餐模板
    await ComboTemplate.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: '套餐模板刪除成功'
    });
  } catch (error) {
    console.error('Error deleting combo template:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};