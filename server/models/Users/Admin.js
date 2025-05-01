import mongoose from 'mongoose';

const administratorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'admin name cannot be blank']
  },
  password: {
    type: String,
    required: [true, 'password cannot be blank']
  },
  role: {
    type: String,
    enum: ['super_admin', 'store_admin'],
    default: 'store_admin'
  },
  managedStore: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: function() {
      return this.role === 'store_admin';
    }
  }
});

export default mongoose.model('Admin', administratorSchema);

/*
const administratorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'admin name cannot be blank']
  },
  password: {
    type: String,
    required: [true, 'password cannot be blank']
  },
  role: {
    type: String,
    enum: ['store_admin', 'brand_admin', 'boss'],
    required: true
  },
  manage: [
    {
      store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
      },
      permission: {
        type: [String],  // 這裡明確指定為陣列
        enum: ['P1', 'P2', 'P3', 'P4']
      }
    }
  ]
});


*/