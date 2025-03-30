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
  
  // 更新優惠券引用 - 使用新的 CouponInstance 模型
  appliedCoupons: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CouponInstance' 
  }],
  
  // 更新訂單項目 - 使用 DishInstance 模型
  items: [
    {
      // 使用 DishInstance 模型，關聯餐點實例
      dishInstance: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'DishInstance',
        required: true
      },
      amount: { type: Number, default: 1 },
      thisMoney: { type: Number, required: true }
    }
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    index: true
  },
  weekday: { type: String }, // 星期
  
  // // 訂單處理狀態追蹤（可選） 暫時不打算增加
  // processingStatus: {
  //   type: String,
  //   enum: ['Received', 'Preparing', 'Ready', 'Delivered', 'Completed'],
  //   default: 'Received'
  // },
}, { timestamps: true, minimize: true });

// 在儲存之前自動計算星期
orderSchema.pre('save', function (next) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const createdAtDate = this.createdAt || new Date(); // 確保有 createdAt
  this.weekday = daysOfWeek[createdAtDate.getDay()]; // 根據 createdAt 計算星期
  next();
});

// 計算訂單總金額的方法
orderSchema.methods.calculateTotal = function() {
  // 計算商品金額
  let total = 0;
  
  if (this.items && this.items.length > 0) {
    // 使用新的 items 結構
    total = this.items.reduce((sum, item) => sum + (item.thisMoney * item.amount), 0);
  }
  
  // 設置商品金額
  this.orderAmount = total;
  
  // 計算總金額 (商品金額 - 折扣 + 運費)
  this.totalMoney = total - (this.discounts || 0) + (this.deliveryFee || 0);
  
  return this.totalMoney;
};

export default mongoose.model('Order', orderSchema);