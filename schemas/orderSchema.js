import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true }, // 店家 ID
  orderNumber: { type: String, required: true }, // 流水號／取餐號
  createdAt: { type: Date, default: Date.now }, // 下單時間
  pickupTime: { type: Date }, // 取餐時間
  platform: { type: String, required: true }, // 訂購平台
  pickupMethod: { type: String, enum: ['內用', '外帶', '外送'], required: true }, // 取餐方式
  paymentMethod: { type: String, required: true }, // 付款方式
  onlinePaymentCode: { type: String }, // 線上支付交易碼
  orderAmount: { type: Number, required: true }, // 商品金額
  discounts: { type: Number, default: 0 }, // 店家優惠
  pointsDiscount: { type: Number, default: 0 }, // 點數折抵
  deliveryFee: { type: Number, default: 0 }, // 運費
  totalPaid: { type: Number, required: true }, // 實付金額
  isConfirmed: { type: Boolean, default: false }, // 訂單成立
  isCancelled: { type: Boolean, default: false }, // 訂單取消
  tableNumber: { type: String }, // 桌號（內用才需要）
  remarks: { type: String }, // 備註
  deliveryRemarks: { type: String }, // 外送備註
  logisticsCancelled: { type: Boolean, default: false }, // （代理）物流取消
  logisticsPickupTime: { type: Date }, // 物流取件時間
  DDPGOrderNumber: { type: String }, // DDPG 訂單編號
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true }, // 餐點
    quantity: { type: Number, required: true }, // 數量
  }], // 訂購餐點
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true }, // 客人資料
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
