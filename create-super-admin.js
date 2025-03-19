import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Administrator from '../schemas/administratorSchema.js';

dotenv.config();

// 連接數據庫
mongoose.connect(process.env.MongoDB_url)
  .then(async () => {
    console.log("MongoDB connected");
    
    try {
      // 檢查是否已有超級管理員
      const existingSuperAdmin = await Administrator.findOne({ role: 'super_admin' });
      if (existingSuperAdmin) {
        console.log('超級管理員已存在!');
        process.exit(0);
      }
      
      // 創建密碼
      const salt = await bcrypt.genSalt(10);
      const password = '123456';
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // 創建超級管理員
      const superAdmin = new Administrator({
        name: 'atsaulio',
        password: hashedPassword,
        role: 'super_admin'
      });
      
      await superAdmin.save();
      console.log(`超級管理員創建成功！用戶名: superadmin, 密碼: ${password}`);
    } catch (error) {
      console.error('創建超級管理員時出錯:', error);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch((err) => {
    console.log("MongoDB connection failed", err);
  });