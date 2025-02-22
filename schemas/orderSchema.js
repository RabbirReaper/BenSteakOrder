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
  isPaid: { type: Boolean, default: false }, // 訂單成立
  isCancelled: { type: Boolean, default: false }, // 訂單取消
  tableNumber: { type: String }, // 桌號（內用才需要）
  remarks: { type: String }, // 備註
  address: { type: String }, // 外送地址
  logisticsCancelled: { type: Boolean, default: false }, // （代理）物流取消
  logisticsPickupTime: { type: Date }, // 物流取件時間
  DDPGOrderNumber: { type: String }, // DDPG 訂單編號
  items: [
    {
      itemModel: { type: String, required: true }, // 餐點模型名稱（例如：MainDish、SideDish）
      itemId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'itemModel' }, // 對應的餐點 ID
      amount: { type: Number, default: 1 }, // 顯示數量
    }
  ],
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }, // 客人資料
  weekday: { type: String }, // 星期
}, { timestamps: true });

// 在儲存之前自動計算星期
orderSchema.pre('save', function (next) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const createdAtDate = this.createdAt || new Date(); // 確保有 createdAt
  this.weekday = daysOfWeek[createdAtDate.getDay()]; // 根據 createdAt 計算星期
  next();
});

export default mongoose.model('Order', orderSchema);
