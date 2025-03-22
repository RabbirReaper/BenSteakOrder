import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['discount', 'exchange'],
    required: true
  },
  discount: {
    type: Number,
    required: function () { return this.type === 'discount'; }
  },
  items: {
    itemModel: {
      type: String,
      required: function () { return this.type === 'exchange'; }
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: function () { return this.type === 'exchange'; },
      refPath: 'items.itemModel'
    },
    amount: {
      type: Number,
      default: 1
    }
  }
});

export default mongoose.model('Coupon', couponSchema);