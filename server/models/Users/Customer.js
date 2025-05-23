import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 顧客姓名
  phoneNumber: { type: String, required: true }, // 顧客電話
  password: {
    type: String,
    required: true
  },
  birthday: { type: Date }, // 顧客生日
  address: { type: String }, // 顧客地址
  gender: { type: String, enum: ['male', 'female', 'other'] }, // 顧客性別
}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);
