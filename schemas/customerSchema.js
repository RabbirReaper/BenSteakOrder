import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 顧客姓名
  phoneNumber: { type: String, required: true }, // 顧客電話
}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);
