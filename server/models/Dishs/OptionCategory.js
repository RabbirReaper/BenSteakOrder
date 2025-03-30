import mongoose from 'mongoose';

const OptionCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  inputType: { type: String, enum: ['single', 'multiple'], required: true }
});

export default mongoose.model('OptionCategory', OptionCategorySchema);