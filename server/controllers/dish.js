// server/controllers/dish.js
import Dish from '../models/Dishs/Dish.js';
import Option from '../models/Dishs/Option.js';
import OptionCategory from '../models/Dishs/OptionCategory.js';
import Combo from '../models/Dishs/Combo.js';
import { v2 as cloudinary } from 'cloudinary';

// 取得所有餐點
export const getDishes = async (req, res) => {
  try {
    const dishes = await Dish.find();
    
    if (!dishes) return res.status(404).json({ success: false, message: 'Dish not found' });

    res.json({
      success: true,
      dishes
    });
  } catch (error) {
    console.error('Error getting dish:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 取得單個餐點
export const getDishById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const dish = await Dish.findById(id)
      .populate({
        path: 'optionCategories.categoryId',
        model: 'OptionCategory'
      });
      
    if (!dish) return res.status(404).json({ success: false, message: 'Dish not found' });

    res.json({
      success: true,
      dish
    });
  } catch (error) {
    console.error('Error getting dish:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 創建新餐點
export const createDish = async (req, res) => {
  try {
    const newDish = new Dish(req.body);
    await newDish.save();

    res.json({
      success: true,
      message: 'Dish created successfully',
      dish: newDish
    });
  } catch (error) {
    console.error('Error creating dish:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 更新餐點
export const updateDish = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 檢查餐點是否存在
    const dish = await Dish.findById(id);
    if (!dish) return res.status(404).json({ success: false, message: 'Dish not found' });
    
    // 更新餐點資料
    Object.keys(req.body).forEach(key => {
      dish[key] = req.body[key];
    });
    
    await dish.save();

    res.json({
      success: true,
      message: 'Dish updated successfully',
      dish
    });
  } catch (error) {
    console.error('Error updating dish:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 刪除餐點
export const deleteDish = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 先找到餐點，檢查是否有圖片
    const dish = await Dish.findById(id);
    if (!dish) return res.status(404).json({ success: false, message: 'Dish not found' });
    
    // 如果餐點有圖片，先刪除雲端上的圖片
    if (dish.image && dish.image.publicId) {
      try {
        await cloudinary.uploader.destroy(dish.image.publicId);
      } catch (cloudinaryError) {
        console.error("刪除雲端圖片時發生錯誤:", cloudinaryError);
        // 即使刪除圖片失敗，仍然繼續刪除餐點資料
      }
    }

    // 刪除餐點資料
    await Dish.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Dish deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting dish:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};