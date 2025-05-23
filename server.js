import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'
import session from 'express-session'
import { fileURLToPath } from 'url'
import menuRoutes from './server/routes/menuRoutes.js';
import storeRoutes from './server/routes/storeRoutes.js';
import cloudinaryRoutes from './server/routes/cloudinaryRoutes.js';
import orderRoutes from './server/routes/orderRoutes.js';
import authRoutes from './server/routes/authRoutes.js'
import { configureSession } from './server/middlewares/auth.js';
import customerRoutes from './server/routes/customerRoutes.js';
import pointSystemRoutes from './server/routes/pointSystemRoutes.js';
import dishTemplateRoutes from './server/routes/dishTemplateRoutes.js';
import dishInstanceRoutes from './server/routes/dishInstanceRoutes.js';
import couponTemplateRoutes from './server/routes/couponTemplateRoutes.js';
import couponInstanceRoutes from './server/routes/couponInstanceRoutes.js';
import stockLogRoutes from './server/routes/stockLogRoutes.js';
import optionCategoryRoutes from './server/routes/optionCategoryRoutes.js';
import optionRoutes from './server/routes/optionRoutes.js';
import comboTemplateRoutes from './server/routes/comboTemplateRoutes.js';
import comboInstanceRoutes from './server/routes/comboInstanceRoutes.js';

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
    // initializeAdmin();
  })
  .catch((err) => {
    console.log("MongoDB connection failed")
    console.log(err)
  })


app.use('/auth', authRoutes)
app.use('/menu', menuRoutes);
app.use('/store', storeRoutes);
app.use('/image', cloudinaryRoutes);
app.use('/order', orderRoutes);
app.use('/customer', customerRoutes);
app.use('/pointSystem', pointSystemRoutes);
app.use('/dishTemplate', dishTemplateRoutes);
app.use('/dishInstance', dishInstanceRoutes);
app.use('/couponTemplate', couponTemplateRoutes);
app.use('/couponInstance', couponInstanceRoutes);
app.use('/stockLog', stockLogRoutes);
app.use('/optionCategory', optionCategoryRoutes);
app.use('/option', optionRoutes);
app.use('/comboTemplate', comboTemplateRoutes);
app.use('/comboInstance', comboInstanceRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})