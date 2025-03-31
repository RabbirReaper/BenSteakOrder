import OptionCategory from '../models/Dishs/OptionCategory.js';

// 獲取所有選項類別
export const getAllOptionCategories = async (req, res) => {
  try {
    const categories = await OptionCategory.find().sort({ name: 1 });
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error getting option categories:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 獲取單個選項類別
export const getOptionCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await OptionCategory.findById(id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: '選項類別不存在' });
    }
    
    res.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error getting option category:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 創建新選項類別
export const createOptionCategory = async (req, res) => {
  try {
    const { name, inputType } = req.body;
    
    // 基本驗證
    if (!name || !inputType) {
      return res.status(400).json({ success: false, message: '名稱和輸入類型為必填欄位' });
    }
    
    // 檢查名稱是否已存在
    const existingCategory = await OptionCategory.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: '此選項類別名稱已存在' });
    }
    
    // 創建新選項類別
    const newCategory = new OptionCategory({
      name,
      inputType
    });
    
    await newCategory.save();
    
    res.status(201).json({
      success: true,
      message: '選項類別創建成功',
      category: newCategory
    });
  } catch (error) {
    console.error('Error creating option category:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 更新選項類別
export const updateOptionCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, inputType } = req.body;
    
    // 基本驗證
    if (!name || !inputType) {
      return res.status(400).json({ success: false, message: '名稱和輸入類型為必填欄位' });
    }
    
    // 檢查名稱是否已存在(排除當前ID)
    const existingCategory = await OptionCategory.findOne({ name, _id: { $ne: id } });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: '此選項類別名稱已存在' });
    }
    
    // 更新選項類別
    const updatedCategory = await OptionCategory.findByIdAndUpdate(
      id,
      { name, inputType },
      { new: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: '選項類別不存在' });
    }
    
    res.json({
      success: true,
      message: '選項類別更新成功',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Error updating option category:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 刪除選項類別
export const deleteOptionCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 檢查是否有關聯的選項
    const Option = mongoose.model('Option');
    const relatedOptions = await Option.countDocuments({ category: id });
    
    if (relatedOptions > 0) {
      return res.status(400).json({ 
        success: false, 
        message: '此選項類別有關聯的選項，無法刪除。請先刪除相關選項。' 
      });
    }
    
    // 檢查是否有關聯的餐點模板
    const DishTemplate = mongoose.model('DishTemplate');
    const relatedTemplates = await DishTemplate.countDocuments({ 
      'optionCategories.categoryId': id 
    });
    
    if (relatedTemplates > 0) {
      return res.status(400).json({ 
        success: false, 
        message: '此選項類別被餐點模板使用中，無法刪除。' 
      });
    }
    
    // 刪除選項類別
    const deletedCategory = await OptionCategory.findByIdAndDelete(id);
    
    if (!deletedCategory) {
      return res.status(404).json({ success: false, message: '選項類別不存在' });
    }
    
    res.json({
      success: true,
      message: '選項類別刪除成功'
    });
  } catch (error) {
    console.error('Error deleting option category:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};