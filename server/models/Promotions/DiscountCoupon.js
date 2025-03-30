import mongoose from 'mongoose';

const discountCouponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  discount: {
    type: Number,
    required: true
  },
  admitItems: [{
    itemModel: {
      type: String,
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'admitItems.itemModel'
    },
  }],
  description: {
    type: String
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  startAt:{
    type: Date,
  },
  expireAt: {
    type: Date,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Customer',
    index: true
  }
});

export default mongoose.model('DiscountCoupon', discountCouponSchema);