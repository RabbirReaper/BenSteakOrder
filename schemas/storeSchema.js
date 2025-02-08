import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 店家名稱
}, { timestamps: true });

export default mongoose.model('Store', storeSchema);
