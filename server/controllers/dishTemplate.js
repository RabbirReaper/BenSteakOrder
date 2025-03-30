import DishTemplate from '../models/Dishs/DishTemplate.js';
import { v2 as cloudinary } from 'cloudinary';

// 取得所有餐點模板
export const getAllDishTemplates = async (req, res) => {
  try {
    const templates = await DishTemplate.find()
      .populate({
        path: 'optionCategories.categoryId',
        model: 'OptionCategory'
      });
    
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error getting dish templates:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 取得單個餐點模板
export const getDishTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await DishTemplate.findById(id)
      .populate({
        path: 'optionCategories.categoryId',
        model: 'OptionCategory'
      });
      
    if (!template) return res.status(404).json({ success: false, message: '餐點模板不存在' });

    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Error getting dish template:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 創建新餐點模板
export const createDishTemplate = async (req, res) => {
  try {
    const newTemplate = new DishTemplate(req.body);
    await newTemplate.save();

    res.json({
      success: true,
      message: '餐點模板創建成功',
      template: newTemplate
    });
  } catch (error) {
    console.error('Error creating dish template:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 更新餐點模板
export const updateDishTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 檢查餐點模板是否存在
    const template = await DishTemplate.findById(id);
    if (!template) return res.status(404).json({ success: false, message: '餐點模板不存在' });
    
    // 更新餐點模板資料
    Object.keys(req.body).forEach(key => {
      template[key] = req.body[key];
    });
    
    await template.save();

    res.json({
      success: true,
      message: '餐點模板更新成功',
      template
    });
  } catch (error) {
    console.error('Error updating dish template:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 更新庫存
export const updateDishStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualStock, displayStock, reason } = req.body;
    
    // 檢查餐點模板是否存在
    const template = await DishTemplate.findById(id);
    if (!template) return res.status(404).json({ success: false, message: '餐點模板不存在' });
    
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
    
    // 創建庫存變動日誌
    if (actualStock !== undefined && actualStock !== previousStock) {
      const StockLog = mongoose.model('StockLog');
      await new StockLog({
        dish: template._id,
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
    console.error('Error updating dish stock:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 刪除餐點模板
export const deleteDishTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 先找到餐點模板，檢查是否有圖片
    const template = await DishTemplate.findById(id);
    if (!template) return res.status(404).json({ success: false, message: '餐點模板不存在' });
    
    // 如果餐點模板有圖片，先刪除雲端上的圖片
    if (template.image && template.image.publicId) {
      try {
        await cloudinary.uploader.destroy(template.image.publicId);
      } catch (cloudinaryError) {
        console.error("刪除雲端圖片時發生錯誤:", cloudinaryError);
        // 即使刪除圖片失敗，仍然繼續刪除餐點模板資料
      }
    }

    // 刪除餐點模板資料
    await DishTemplate.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: '餐點模板刪除成功'
    });
  } catch (error) {
    console.error('Error deleting dish template:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};