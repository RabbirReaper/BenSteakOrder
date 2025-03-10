import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 顧客姓名
  phoneNumber: { type: String, required: true }, // 顧客電話
  password: {
    type: String,
    default: phoneNumber,
    required: true
  },
  coupons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' }], // 顧客擁有的優惠券
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }], // 顧客的訂單
}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);
