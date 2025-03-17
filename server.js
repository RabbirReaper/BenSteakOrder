import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'
import session from 'express-session'
import { fileURLToPath } from 'url'
import dishRoutes from './server/routes/dishRoutes.js';
import menuRoutes from './server/routes/menuRoutes.js';
import storeRoutes from './server/routes/storeRoutes.js';
import cloudinaryRoutes from './server/routes/cloudinaryRoutes.js';
import orderRoutes from './server/routes/orderRoutes.js';
import authRoutes from './server/routes/authRoutes.js'
import { configureSession } from './middlewares/auth.js';


dotenv.config()
const app = express()
const port = process.env.PORT || 8700

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
configureSession(app);



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const filePath = join(__dirname, 'src', 'views', 'index.html');



mongoose.connect(`${process.env.MongoDB_url}`)
  .then(() => {
    console.log("MongoDB connected")
  })
  .then(async () => {
    // 取得 native db 實例
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('資料庫連線尚未建立');
    }
    // 使用 collStats 指令取得 orders 集合統計資訊
    const stats = await db.command({ collStats: 'orders' });
    console.log(`orders 平均大小 :${(stats.avgObjSize/1024).toFixed(2)} KB`);
  })
  .catch((err) => {
    console.log("MongoDB connection failed")
    console.log(err)
  })


app.use('/auth', authRoutes)
app.use('/dish', dishRoutes);
app.use('/menu', menuRoutes);
app.use('/store', storeRoutes);
app.use('/image', cloudinaryRoutes);
app.use('/order', orderRoutes);




// const createAdmin = async () => {
//   try {
//     const adminData = {
//       name: 'atsaulio',
//       password: '$2a$10$tDwA2dIPXJuj2v4qNiX/du/D5KUL7c41JdsEmW5Y5L15.yhO4U.uu'
//     };
//     await new Administrator(adminData).save();
//     console.log('Admin created successfully');
//   } catch (error) {
//     console.error('Error creating admin:', error);
//   }
// };



app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

