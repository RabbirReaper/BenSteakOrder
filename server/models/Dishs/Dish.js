import mongoose from 'mongoose';

const DishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  basePrice: { type: Number, required: true },
  optionCategories: [{
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'OptionCategory' },
    order: { type: Number, default: 0 } // 新增 order 欄位儲存順序
  }],
  image: {
    url: { type: String },
    publicId: { type: String },
    alt: { type: String }
  }
});

export default mongoose.model('Dish', DishSchema);