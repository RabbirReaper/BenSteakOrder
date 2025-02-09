import mongoose from 'mongoose';

const sideDishSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 附餐名稱
  description: { type: String }, // 餐點說明
  price: { type: Number, required: true }, // 餐點價格
});

export const SideDish = mongoose.model('SideDish', sideDishSchema);
