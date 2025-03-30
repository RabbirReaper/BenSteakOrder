import mongoose from 'mongoose';

// DishTemplate 模型
const DishTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  basePrice: { type: Number, required: true },
  optionCategories: [{
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'OptionCategory' },
    order: { type: Number, default: 0 }
  }],
  image: {
    url: { type: String },
    publicId: { type: String },
    alt: { type: String }
  },
  isAvailable: { type: Boolean, default: true },
  description: { type: String },
  // tags: [{ type: String }], //未來考慮新增
  // version: { type: Number, default: 1 }, // 感覺沒必要
  
  // 新增庫存相關欄位
  actualStock: { type: Number, default: 0 }, // 實際庫存，如果為-1表示停用此功能，為0表示賣完
  displayStock: { type: Number, default: 0 }, // 顯示給客人的庫存，如果為-1表示停用此功能，為0表示賣完，不能大於actualStock
});

export default mongoose.model("DishTemplate",DishTemplateSchema)