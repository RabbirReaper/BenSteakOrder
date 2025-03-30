import mongoose from 'mongoose';

const exchangeCouponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  exchangeItem: {
    itemModel: {
      type: String,
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'exchangeItem.itemModel'
    },
  },
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

export default mongoose.model('ExchangeCoupon', exchangeCouponSchema);