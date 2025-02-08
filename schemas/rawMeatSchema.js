import mongoose from 'mongoose';

const rawMeatSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 生肉名稱
  price: { type: Number, required: true }, // 價格
}, { timestamps: true });

export default mongoose.model('RawMeat', rawMeatSchema);
