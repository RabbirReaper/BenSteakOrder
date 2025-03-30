import mongoose from 'mongoose';

const ComboSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dishes: [{
    dish: { type: Schema.Types.ObjectId, ref: 'Dish', required: true },
    options: [{ type: Schema.Types.ObjectId, ref: 'Option' }]
  }],
  comboPrice: { type: Number, required: true },
  description: { type: String },
  image: {
    url: { type: String },
    publicId: { type: String },
    alt: { type: String }
  }
});

export default mongoose.model('Combo', ComboSchema);