import mongoose from 'mongoose';

const DishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  basePrice: { type: Number, required: true },
  type: { type: String, enum: ['MainDish', 'SideDish', 'RawMeat'], required: true },
  optionCategories: [{ type: Schema.Types.ObjectId, ref: 'OptionCategory' }],
  image: {
    url: { type: String },
    publicId: { type: String },
    alt: { type: String }
  }
});

export default mongoose.model('Dish', DishSchema);