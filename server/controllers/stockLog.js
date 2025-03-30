import StockLog from '../models/Stores/StockLog.js';
import DishTemplate from '../models/Dishs/DishTemplate.js';
import mongoose from 'mongoose';

// 獲取特定餐點的庫存日誌
export const getStockLogsByDish = async (req, res) => {
  try {
    const { dishId } = req.params;
    
    // 檢查餐點是否存在
    const dish = await DishTemplate.findById(dishId);
    if (!dish) {
      return res.status(404).json({ success: false, message: '餐點不存在' });
    }
    
    // 獲取庫存日誌
    const logs = await StockLog.find({ dish: dishId })
      .populate('admin', 'name')
      .populate('order')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Error getting stock logs:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 獲取所有庫存日誌
export const getAllStockLogs = async (req, res) => {
  try {
    const { start, end, dishName, changeType } = req.query;
    
    const filter = {};
    
    // 根據時間範圍過濾
    if (start || end) {
      filter.createdAt = {};
      if (start) filter.createdAt.$gte = new Date(start);
      if (end) filter.createdAt.$lt = new Date(end);
    }
    
    // 根據餐點名稱過濾
    if (dishName) {
      filter.dishName = { $regex: dishName, $options: 'i' };
    }
    
    // 根據變動類型過濾
    if (changeType) {
      filter.changeType = changeType;
    }
    
    // 獲取庫存日誌
    const logs = await StockLog.find(filter)
      .populate('admin', 'name')
      .populate('order')
      .sort({ createdAt: -1 })
      .limit(100); // 限制數量避免返回過多數據
    
    res.json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Error getting all stock logs:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 手動調整庫存
export const adjustStock = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { dishId, adjustAmount, reason } = req.body;
    
    // 基本驗證
    if (!dishId || adjustAmount === undefined) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: '餐點ID和調整數量為必填欄位' });
    }
    
    // 檢查餐點是否存在
    const dish = await DishTemplate.findById(dishId).session(session);
    if (!dish) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: '餐點不存在' });
    }
    
    // 如果是減少庫存，確保不會變成負數
    if (adjustAmount < 0 && dish.actualStock !== -1 && dish.actualStock + adjustAmount < 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: '庫存不足，無法減少' });
    }
    
    // 記錄原始庫存
    const previousStock = dish.actualStock;
    
    // 調整庫存
    if (dish.actualStock !== -1) {
      dish.actualStock += adjustAmount;
    }
    
    // 調整顯示庫存，確保不大於實際庫存
    if (dish.displayStock !== -1 && dish.actualStock !== -1) {
      dish.displayStock = Math.min(dish.displayStock + adjustAmount, dish.actualStock);
    }
    
    await dish.save({ session });
    
    // 創建庫存日誌
    const stockLog = new StockLog({
      dish: dish._id,
      dishName: dish.name,
      previousStock,
      newStock: dish.actualStock,
      changeAmount: adjustAmount,
      changeType: adjustAmount > 0 ? 'manual_add' : 'manual_subtract',
      reason: reason || '管理員手動調整',
      admin: req.session.user_id,
      createdAt: new Date()
    });
    
    await stockLog.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({
      success: true,
      message: '庫存調整成功',
      log: stockLog
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error adjusting stock:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 初始化餐點庫存
export const initializeStock = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { dishId, initialStock } = req.body;
    
    // 基本驗證
    if (!dishId || initialStock === undefined) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: '餐點ID和初始庫存為必填欄位' });
    }
    
    // 檢查餐點是否存在
    const dish = await DishTemplate.findById(dishId).session(session);
    if (!dish) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: '餐點不存在' });
    }
    
    // 記錄原始庫存
    const previousStock = dish.actualStock;
    
    // 設置庫存
    dish.actualStock = initialStock;
    dish.displayStock = initialStock;
    
    await dish.save({ session });
    
    // 創建庫存日誌
    const stockLog = new StockLog({
      dish: dish._id,
      dishName: dish.name,
      previousStock,
      newStock: initialStock,
      changeAmount: initialStock - (previousStock !== -1 ? previousStock : 0),
      changeType: 'initial_stock',
      reason: '初始化庫存',
      admin: req.session.user_id,
      createdAt: new Date()
    });
    
    await stockLog.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({
      success: true,
      message: '庫存初始化成功',
      log: stockLog
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error initializing stock:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};