import mongoose from "mongoose";

const ComboInstanceSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ComboTemplate',
    required: true
  },
  // 冗餘儲存一些模板資訊
  name: { type: String, required: true },
  basePrice: { type: Number, required: true },
  // 套餐內的餐點實例
  items: [{
    dishInstance: { type: mongoose.Schema.Types.ObjectId, ref: 'DishInstance' },
    dishTemplate: { 
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'DishTemplate' },
      name: { type: String, required: true }
    },
    options: [{
      category: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'OptionCategory' },
        name: { type: String, required: true }
      },
      selections: [{
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Option' },
        name: { type: String, required: true },
        price: { type: Number, default: 0 }
      }]
    }]
  }],
  specialInstructions: { type: String }, // 特殊要求
  finalPrice: { type: Number, required: true }, // 計算後的最終價格
  // 關聯
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
}, { timestamps: true });

export default mongoose.model("ComboInstance", ComboInstanceSchema);