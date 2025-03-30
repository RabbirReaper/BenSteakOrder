import mongoose from 'mongoose';

// 庫存變動日誌模型
const StockLogSchema = new mongoose.Schema({
  dish: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'DishTemplate', 
    required: true 
  },
  dishName: { type: String, required: true }, // 冗餘儲存餐點名稱，方便查詢
  previousStock: { type: Number, required: true }, // 變動前庫存
  newStock: { type: Number, required: true }, // 變動後庫存
  changeAmount: { type: Number, required: true }, // 變動數量 (正數為增加，負數為減少)
  changeType: { 
    type: String, 
    enum: ['manual_add', 'manual_subtract', 'order', 'system_adjustment', 'initial_stock'],
    required: true
  }, // 變動類型
  reason: { type: String }, // 變動原因說明 (手動調整時必須提供)
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order' 
  }, // 關聯訂單 (如果是訂單消耗)
  admin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin' 
  }, // 關聯管理員 (如果是手動調整)
  createdAt: { type: Date, default: Date.now }, // 變動時間
});

export default mongoose.model('StockLog', StockLogSchema);