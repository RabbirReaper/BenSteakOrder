import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema({
  dishReference: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish' },
  name: { type: String, required: false },
  price: { type: Number, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'OptionCategory', required: true },
});

export default mongoose.model('Option', OptionSchema);