import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true }, // 店家 ID
  orderNumber: { type: String, required: true }, // 流水號／取餐號
  scheduledPickupTime: { type: Date }, // 預定取餐時間
  pickupTime: { type: Date }, // 實際取餐時間
  platform: { type: String, required: true }, // 訂購平台
  pickupMethod: { type: String, enum: ['內用', '自取', '外送'], required: true }, // 取餐方式
  paymentType: {
    type: String,
    enum: ['現場付款', '線上付款'],
    required: true
  }, // 付款類型
  paymentMethod: {
    type: String,
    enum: ['現金', 'linepay', 'FoodPanda', 'UberEat'],
    required: true
  }, // 具體付款方式  
  onlinePaymentCode: { type: String }, // 線上支付交易碼
  orderAmount: { type: Number, required: true }, // 商品金額
  discounts: { type: Number, default: 0 }, // 現場折扣
  deliveryFee: { type: Number, default: 0 }, // 運費
  totalMoney: { type: Number }, // 實付金額
  orderStatus: { type: String, enum: ['Unpaid', 'Completed', 'Canceled'], default: 'Unpaid' }, // 訂單狀態
  tableNumber: { type: String }, // 桌號（內用才需要）
  remarks: { type: String }, // 備註
  deliveryAddress: { type: String }, // 外送地址
  logisticsCancelled: { type: Boolean, default: false }, // 物流取消
  logisticsPickupTime: { type: Date }, // 物流取件時間
  discountCouponId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DiscountCoupon' }],
  exchangeCouponId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ExchangeCoupon' }],
  items: [
    {
      itemModel: {
        type: String,
        required: true,
        enum: ['Dish', 'Combo'] // 限制只有這兩種模型可用
      },
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'items.itemModel' // 根據 itemModel 動態決定引用的 model
      },
      amount: { type: Number, default: 1 },
      options: [{
        name: {
          type: String,
          required: true
        },
        cell: [String]
      }],
      thisMoney: { type: Number, required: true }
    }
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    index: true
  },
  weekday: { type: String }, // 星期
}, { timestamps: true, minimize: true });

// 在儲存之前自動計算星期
orderSchema.pre('save', function (next) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const createdAtDate = this.createdAt || new Date(); // 確保有 createdAt
  this.weekday = daysOfWeek[createdAtDate.getDay()]; // 根據 createdAt 計算星期
  next();
});

export default mongoose.model('Order', orderSchema);
