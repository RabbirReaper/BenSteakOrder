// server/models/Promotions/CustomerCoupon.js
import mongoose from 'mongoose';

const couponInstanceSchema = new mongoose.Schema({
  // 關聯到模板
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CouponTemplate',
    required: true
  },
  // 冗餘存儲關鍵信息，以防模板被更改
  name: { type: String, required: true },
  type: { type: String, enum: ['discount', 'exchange'], required: true },
  discount: { type: Number }, // 折扣金額（如果是折扣類型）
  exchangeItem: {
    itemModel: { type: String },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'exchangeItem.itemModel'
    },
  },
  // 使用狀態
  isUsed: { type: Boolean, default: false },
  usedAt: { type: Date },
  // 有效期
  startAt: { type: Date, required: true },
  expireAt: { type: Date, required: true },
  // 擁有者
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  // 關聯的訂單（如果使用了）
  usedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  // 獲取方式
  acquisitionMethod: {
    type: String,
    enum: ['purchase', 'activity'],
    required: true
  },
}, { timestamps: true });

export default mongoose.model('CouponInstance', couponInstanceSchema);