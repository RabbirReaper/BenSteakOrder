const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  discount: {
    type: Number,
    required: true
  },
  isUsed:{
    type: Boolean,
    default: false,
    required: true
  }
});

export default mongoose.model('Coupon', couponSchema);