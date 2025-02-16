import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 店家名稱
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true }, // 菜單
});

export default mongoose.model('Store', storeSchema);
