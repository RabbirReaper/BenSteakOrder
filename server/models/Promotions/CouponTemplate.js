import mongoose from 'mongoose';

const couponTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['discount', 'exchange'], 
    required: true 
  },
  // 折扣類型的額外欄位
  discount: { 
    type: Number,
    required: function() { return this.type === 'discount'; }
  },
  // 兌換類型的額外欄位
  exchangeItem: {
    itemModel: { 
      type: String,
      required: function() { return this.type === 'exchange'; }
    },
    itemId: { 
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'exchangeItem.itemModel',
      required: function() { return this.type === 'exchange'; }
    },
  },
  // 適用商品清單（折扣類型才需考慮，可選，若為空則適用於所有商品）
  admitItems: [{
    itemModel: { type: String },
    itemId: { 
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'admitItems.itemModel'
    },
  }],
  description: { type: String },
  // 價格 (若需購買)
  price: { type: Number, default: 0 },
  // 是否上架
  active: { type: Boolean, default: false },
  // 有效期限設置
  startAt: { type: Date }, // 上架開始日期
  endAt: { type: Date }, // 上架結束日期
  // 庫存管理
  stock: { type: Number, default: -1 }, // -1 表示無限制
  // 其他可能的限制
  // limitPerCustomer: { type: Number, default: -1 }, // 每人限制數量，-1 為無限制
}, { timestamps: true });

export default mongoose.model('CouponTemplate', couponTemplateSchema);