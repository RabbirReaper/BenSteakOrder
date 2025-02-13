import mongoose from 'mongoose';

const rawMeatSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 生肉名稱
  description: { type: String, required: true }, // 餐點說明
  price: { type: Number, required: true }, // 價格
  image: {
    url: String,        // Picture URL
    publicId: String,   // Picture ID
    alt: String         // Picture description
  }
});

export default mongoose.model('RawMeat', rawMeatSchema);
