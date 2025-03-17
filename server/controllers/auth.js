import bcrypt from 'bcrypt';
import Administrator from '../models/Users/Admin.js';

// 處理登入
export const login = async (req, res) => {
  try {
    const { name, password } = req.body;
    const admin = await Administrator.findOne({ name });

    if (!admin) { // adminname not found
      return res.status(401).send('adminname or password errors');
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (validPassword) {
      req.session.user_id = admin._id;
      return res.send('Login successful');
    } else { // invalid password
      return res.status(401).send('adminname or password errors');
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).send('Internal server error');
  }
};

// 處理登出
export const logout = (req, res) => {
  req.session.user_id = null;
  res.send('Logout successful');
};

// 獲取當前用戶信息
export const getCurrentUser = (req, res) => {
  if (req.session.user_id) {
    // 根據需要回傳更多使用者資料
    res.json({ loggedIn: true, user_id: req.session.user_id });
  } else {
    res.json({ loggedIn: false });
  }
};

// 創建新管理員
export const createUser = async (req, res) => {
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
};

// 刪除管理員
export const deleteUser = async (req, res) => {
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
};