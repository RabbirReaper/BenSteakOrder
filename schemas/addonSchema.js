import mongoose from 'mongoose';

const addonSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 食材名稱
  price: { type: Number, required: true }, // 加點價格
});

export default mongoose.model('Addon', addonSchema);