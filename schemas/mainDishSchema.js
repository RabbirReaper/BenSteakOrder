import mongoose from 'mongoose';

// 主餐通用 Schema
const mainDishSchema = new mongoose.Schema({
  category: { type: String, enum: ['Steak', 'Non-Steak'], required: true }, // 子類別（牛排類或非牛排類）
  name: { type: String, required: true }, // 餐點名稱
  sauceOptions: [String], // 醬料選項（例如：蘑菇醬、黑胡椒醬）
  price: { type: Number, required: true }, // 餐點價格
  extraPrice: { type: Number }, // 加點價格
  extraOptions: [String], // 額外需求（例如：麵換蛋）
  description: { type: String }, // 餐點說明
  steakDoneness: { // 熟度選項（僅適用於牛排類）
    type: [String], default: ['5分熟', '7分熟', '9分熟'], required: function () {
      return this.category === 'Steak';
    }
  }, 
  image: {
    url: String,        // Picture URL
    publicId: String,   // Picture ID
    alt: String         // Picture description
  }
});

export default mongoose.model('MainDish', mainDishSchema);
