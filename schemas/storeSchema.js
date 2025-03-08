import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 店家名稱
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }, // 菜單
  announcements: [{
    title: { type: String, required: true }, // 公告名稱
    content: { type: String, required: true } // 公告內容
  }],
  image: {
    url: String,        // Picture URL
    publicId: String,   // Picture ID
    alt: String         // Picture description
  }
});

export default mongoose.model('Store', storeSchema);
