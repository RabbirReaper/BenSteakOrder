import mongoose from 'mongoose';

const ComboTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dishes: [{
    dish: { type: mongoose.Schema.Types.ObjectId, ref: 'DishTemplate', required: true },
    options: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Option' }]
  }],
  basePrice: { type: Number, required: true },
  description: { type: String },
  image: {
    url: { type: String },
    publicId: { type: String },
    alt: { type: String }
  },
  isAvailable: { type: Boolean, default: true },
  actualStock: { type: Number, default: -1 }, // 實際庫存，如果為-1表示停用此功能，為0表示賣完
  displayStock: { type: Number, default: -1 }, // 顯示給客人的庫存，如果為-1表示停用此功能
});

export default mongoose.model('ComboTemplate', ComboTemplateSchema);