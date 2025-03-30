import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema({
  name: { type: String, required: false },
  price: { type: Number, default: 0 },
  order: { type: Number, default: 0 }, // 順序
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'OptionCategory', required: true },
});

export default mongoose.model('Option', OptionSchema);