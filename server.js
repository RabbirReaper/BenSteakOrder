import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'
import session from 'express-session'
import Administrator from './schemas/administratorSchema.js'
import { fileURLToPath } from 'url'
import bcrypt from 'bcrypt'
import MainDish from './schemas/mainDishSchema.js'
import ElseDish from './schemas/elseDishSchema.js'
import Addon from './schemas/addonSchema.js'
import RawMeat from './schemas/rawMeatSchema.js'


dotenv.config()
const app = express()
const port = 8700

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 60 * 1000 // 30 分鐘後過期
  }
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const filePath = join(__dirname, 'src', 'views', 'index.html');



mongoose.connect(`${process.env.MongoDB_url}`)
  .then(() => {
    console.log("MongoDB connected")
  })
  .catch((err) => {
    console.log("MongoDB connection failed")
    console.log(err)
  })

app.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    const admin = await Administrator.findOne({ name });

    if (!admin) { // adminname not found
      return res.status(401).send('adminname or password arrors');
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (validPassword) {
      req.session.user_id = admin._id;
      return res.send('Login successful');
    } else { // invalid password
      return res.status(401).send('adminname or password arrors');
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).send('Internal server error');
  }
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.send('Logout successful');
});

app.get('/api/current_user', (req, res) => {
  if (req.session.user_id) {
    // 根據需要回傳更多使用者資料
    res.json({ loggedIn: true, user_id: req.session.user_id });
  } else {
    res.json({ loggedIn: false });
  }
});

app.post('/mainDish', async (req, res) => {
  try {
    // console.log(req.body)
    const mainDish = new MainDish(req.body);
    await mainDish.save();
    res.send('Main dish created successfully');
  } catch (error) {
    console.error('Error creating main dish:', error);
    res.status(500).send('Internal server error');
  }
});

app.post('/elseDish', async (req, res) => {
  try {
    // console.log(req.body)
    const elseDish = new ElseDish(req.body);
    await elseDish.save();
    res.send('Else dish created successfully');
  } catch (error) {
    console.error('Error creating else dish:', error);
    res.status(500).send('Internal server error');
  }
});

app.post('/addon', async (req, res) => {
  try {
    // console.log(req.body)
    const addon = new Addon(req.body);
    await addon.save();
    res.send('Addon created successfully');
  } catch (error) {
    console.error('Error creating addon:', error);
    res.status(500).send('Internal server error');
  }
});

app.post('/rawMeat', async (req, res) => {
  try {
    const rawMeat = new RawMeat(req.body);
    await rawMeat.save();
    res.send('Raw meat created successfully');
  } catch (error) {
    console.error('Error creating raw meat:', error);
    res.status(500).send('Internal server error');
  }
})


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

