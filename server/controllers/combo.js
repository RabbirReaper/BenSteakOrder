import Combo from '../models/Dishs/Combo.js';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

// 獲取所有套餐
export const getAllCombos = async (req, res) => {
  try {
    const combos = await Combo.find()
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
      .sort({ comboPrice: 1 });
    
    res.json({
      success: true,
      combos
    });
  } catch (error) {
    console.error('Error getting combos:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 獲取單個套餐
export const getComboById = async (req, res) => {
  try {
    const { id } = req.params;
    const combo = await Combo.findById(id)
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
    
    if (!combo) {
      return res.status(404).json({ success: false, message: '套餐不存在' });
    }
    
    res.json({
      success: true,
      combo
    });
  } catch (error) {
    console.error('Error getting combo:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 創建新套餐
export const createCombo = async (req, res) => {
  try {
    const { name, dishes, comboPrice, description, image } = req.body;
    
    // 基本驗證
    if (!name || !comboPrice || !Array.isArray(dishes) || dishes.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '名稱、餐點和套餐價格為必填欄位' 
      });
    }
    
    // 創建新套餐
    const newCombo = new Combo({
      name,
      dishes,
      comboPrice,
      description,
      image
    });
    
    await newCombo.save();
    
    res.status(201).json({
      success: true,
      message: '套餐創建成功',
      combo: newCombo
    });
  } catch (error) {
    console.error('Error creating combo:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 更新套餐
export const updateCombo = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dishes, comboPrice, description, image } = req.body;
    
    // 基本驗證
    if (!name || !comboPrice || !Array.isArray(dishes) || dishes.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '名稱、餐點和套餐價格為必填欄位' 
      });
    }
    
    // 檢查套餐是否存在
    const combo = await Combo.findById(id);
    if (!combo) {
      return res.status(404).json({ success: false, message: '套餐不存在' });
    }
    
    // 準備更新資料
    const updateData = {
      name,
      dishes,
      comboPrice,
      description
    };
    
    // 如果有新圖片，更新圖片
    if (image && image !== combo.image) {
      updateData.image = image;
    }
    
    // 更新套餐
    const updatedCombo = await Combo.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    res.json({
      success: true,
      message: '套餐更新成功',
      combo: updatedCombo
    });
  } catch (error) {
    console.error('Error updating combo:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 刪除套餐
export const deleteCombo = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 檢查套餐是否存在
    const combo = await Combo.findById(id);
    if (!combo) {
      return res.status(404).json({ success: false, message: '套餐不存在' });
    }
    
    // 如果有圖片，先刪除雲端上的圖片
    if (combo.image && combo.image.publicId) {
      try {
        await cloudinary.uploader.destroy(combo.image.publicId);
      } catch (cloudinaryError) {
        console.error("刪除雲端圖片時發生錯誤:", cloudinaryError);
        // 即使刪除圖片失敗，仍然繼續刪除套餐資料
      }
    }
    
    // 刪除套餐
    await Combo.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: '套餐刪除成功'
    });
  } catch (error) {
    console.error('Error deleting combo:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};