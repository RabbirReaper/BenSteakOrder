import Option from '../models/Dishs/Option.js';
import OptionCategory from '../models/Dishs/OptionCategory.js';
import mongoose from 'mongoose';

// 獲取所有選項
export const getAllOptions = async (req, res) => {
  try {
    const { categoryId } = req.query;
    
    // 過濾條件
    const filter = {};
    if (categoryId) {
      filter.category = categoryId;
    }
    
    const options = await Option.find(filter)
      .populate('category')
      .sort({ category: 1, order: 1, name: 1 });
      
    res.json({
      success: true,
      options
    });
  } catch (error) {
    console.error('Error getting options:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 獲取單個選項
export const getOptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const option = await Option.findById(id).populate('category');
    
    if (!option) {
      return res.status(404).json({ success: false, message: '選項不存在' });
    }
    
    res.json({
      success: true,
      option
    });
  } catch (error) {
    console.error('Error getting option:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 創建新選項
export const createOption = async (req, res) => {
  try {
    const { name, price, order, category } = req.body;
    
    // 基本驗證
    if (!name || !category) {
      return res.status(400).json({ success: false, message: '名稱和類別為必填欄位' });
    }
    
    // 確認類別是否存在
    const categoryExists = await OptionCategory.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ success: false, message: '選項類別不存在' });
    }
    
    // 創建新選項
    const newOption = new Option({
      name,
      price: price || 0,
      order: order || 0,
      category
    });
    
    await newOption.save();
    
    res.status(201).json({
      success: true,
      message: '選項創建成功',
      option: newOption
    });
  } catch (error) {
    console.error('Error creating option:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 更新選項
export const updateOption = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, order, category } = req.body;
    
    // 基本驗證
    if (!name || !category) {
      return res.status(400).json({ success: false, message: '名稱和類別為必填欄位' });
    }
    
    // 確認類別是否存在
    const categoryExists = await OptionCategory.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ success: false, message: '選項類別不存在' });
    }
    
    // 更新選項
    const updatedOption = await Option.findByIdAndUpdate(
      id,
      {
        name,
        price: price || 0,
        order: order || 0,
        category
      },
      { new: true }
    );
    
    if (!updatedOption) {
      return res.status(404).json({ success: false, message: '選項不存在' });
    }
    
    res.json({
      success: true,
      message: '選項更新成功',
      option: updatedOption
    });
  } catch (error) {
    console.error('Error updating option:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 刪除選項
export const deleteOption = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 檢查是否有關聯的餐點實例使用此選項
    const DishInstance = mongoose.model('DishInstance');
    const relatedInstances = await DishInstance.countDocuments({
      'options.selections.id': id
    });
    
    if (relatedInstances > 0) {
      return res.status(400).json({ 
        success: false, 
        message: '此選項被餐點實例使用中，無法刪除。' 
      });
    }
    
    // 刪除選項
    const deletedOption = await Option.findByIdAndDelete(id);
    
    if (!deletedOption) {
      return res.status(404).json({ success: false, message: '選項不存在' });
    }
    
    res.json({
      success: true,
      message: '選項刪除成功'
    });
  } catch (error) {
    console.error('Error deleting option:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 批量更新選項排序
export const updateOptionsOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { orderUpdates } = req.body;
    
    // 基本驗證
    if (!orderUpdates || !Array.isArray(orderUpdates)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: '請提供有效的排序更新資料' });
    }
    
    // 批量更新
    for (const update of orderUpdates) {
      const { id, order } = update;
      
      if (!id || typeof order !== 'number') {
        continue;
      }
      
      await Option.findByIdAndUpdate(id, { order }, { session });
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({
      success: true,
      message: '選項排序更新成功'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error updating options order:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};