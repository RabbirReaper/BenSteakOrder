import mongoose from 'mongoose';

const elseDishSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 附餐名稱
  description: { type: String }, // 餐點說明
  price: { type: Number, required: true }, // 餐點價格
  image: {
    url: String,        // Picture URL
    publicId: String,   // Picture ID
    alt: String         // Picture description
  }
});

export default mongoose.model('ElseDish', elseDishSchema);