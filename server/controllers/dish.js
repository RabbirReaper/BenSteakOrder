import MainDish from '../models/Dishs/MainDish.js';
import ElseDish from '../models/Dishs/ElseDish.js';
import Addon from '../models/Dishs/Addon.js';
import RawMeat from '../models/Dishs/RawMeat.js';
import { v2 as cloudinary } from 'cloudinary';

const modelMap = {
  mainDish: MainDish,
  elseDish: ElseDish,
  addon: Addon,
  rawMeat: RawMeat
};

// 取得多個餐點
export const getDishes = async (req, res) => {
  try {
    const { type } = req.params;
    const model = modelMap[type];

    if (!model) return res.status(400).json({ success: false, message: 'Invalid dish type' });

    const dishes = await model.find({});
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
    const { type, id } = req.params;
    const model = modelMap[type];

    if (!model) return res.status(400).json({ success: false, message: 'Invalid dish type' });

    const dish = await model.findById(id);
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
    const { type } = req.params;
    const model = modelMap[type];

    if (!model) return res.status(400).json({ success: false, message: 'Invalid dish type' });

    const newDish = new model(req.body);
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
    const { type, id } = req.params;
    const model = modelMap[type];

    if (!model) return res.status(400).json({ success: false, message: 'Invalid dish type' });

    const updatedDish = await model.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedDish) return res.status(404).json({ success: false, message: 'Dish not found' });

    res.json({
      success: true,
      message: 'Dish updated successfully',
      dish: updatedDish
    });
  } catch (error) {
    console.error('Error updating dish:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 刪除餐點
export const deleteDish = async (req, res) => {
  try {
    const { type, id } = req.params;
    const model = modelMap[type];

    if (!model) return res.status(400).json({ success: false, message: 'Invalid dish type' });

    // 先找到餐點，檢查是否有圖片
    const dish = await model.findById(id);
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
    await model.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Dish deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting dish:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};