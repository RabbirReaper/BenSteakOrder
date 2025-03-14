import mongoose from 'mongoose';

const administratorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'admin name cannot be blank']
  },
  password: {
    type: String,
    required: [true, 'password cannot be blank']
  }
});

export default mongoose.model('administrator', administratorSchema);