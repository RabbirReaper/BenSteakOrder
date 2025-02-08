import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  category: { type: String, required: true }, // 菜單類別（例如：主餐、附餐、食材加點）
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'itemModel' }, // 對應的餐點 ID
      itemModel: { type: String, required: true }, // 餐點模型名稱（例如：MainDish、SideDish）
      order: { type: Number, default: 0 }, // 顯示順序
    }
  ],
}, { timestamps: true });

export default mongoose.model('Menu', menuSchema);

