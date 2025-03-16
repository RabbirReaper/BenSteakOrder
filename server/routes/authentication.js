import express from "express";
import bcrypt from 'bcrypt';
import session from 'express-session';
import Administrator from '../models/Users/Admin.js';

const router = express.Router();
router.use(express.json());
router.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 60 * 1000 // 30 分鐘後過期
  }
}));

router.post('/login', async (req, res) => {
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

router.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.send('Logout successful');
});

router.get('/current_user', (req, res) => {
  if (req.session.user_id) {
    // 根據需要回傳更多使用者資料
    res.json({ loggedIn: true, user_id: req.session.user_id });
  } else {
    res.json({ loggedIn: false });
  }
});

router.post('/createUser', async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!req.session.user_id) {
      return res.status(401).send('Unauthorized');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Administrator({
      name,
      password: hashedPassword
    });

    await newAdmin.save();
    res.status(201).send('User created successfully');
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).send('Internal server error');
  }
});

router.delete('/deleteUser/:id', async (req, res) => {
  try {
    if (!req.session.user_id) {
      return res.status(401).send('Unauthorized');
    }

    const userId = req.params.id;
    const result = await Administrator.findByIdAndDelete(userId);

    if (!result) {
      return res.status(404).send('User not found');
    }

    res.send('User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).send('Internal server error');
  }
});

export default router;