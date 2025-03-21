import bcrypt from 'bcrypt';
import Administrator from '../models/Users/Admin.js';

// 管理員登入
export const authLogin = async (req, res) => {
  try {
    const { name, password } = req.body;
    const admin = await Administrator.findOne({ name });

    if (!admin) {
      return res.status(401).send('用戶名或密碼錯誤');
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (validPassword) {
      req.session.user_id = admin._id;
      req.session.role = admin.role;
      if (admin.role === 'store_admin') {
        req.session.store_id = admin.managedStore;
      }
      return res.send({
        success: true,
        role: admin.role,
        storeId: admin.managedStore || null
      });
    } else {
      return res.status(401).send('用戶名或密碼錯誤');
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).send('伺服器錯誤');
  }
};

// 創建管理員（僅限超級管理員）
export const createAdmin = async (req, res) => {
  try {
    const { name, password, role, managedStore } = req.body;

    // 驗證資料
    if (!name || !password) {
      return res.status(400).send('Name and password are required');
    }
    
    if (role === 'store_admin' && !managedStore) {
      return res.status(400).send('Store admin must have a managed store');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Administrator({
      name,
      password: hashedPassword,
      role,
      managedStore: role === 'store_admin' ? managedStore : undefined
    });

    await newAdmin.save();
    res.status(201).send('Admin created successfully');
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).send('Internal server error');
  }
};

// 處理登出
export const logout = (req, res) => {
  req.session.user_id = null;
  req.session.customer_id = null;
  res.send('Logout successful');
};

// 獲取當前用戶信息
export const getCurrentUser = (req, res) => {
  if (req.session.user_id) {
    // 管理員登入
    res.json({ 
      loggedIn: true, 
      role: req.session.role,
      user_id: req.session.user_id,
      store_id: req.session.store_id || null
    });
  } else if (req.session.customer_id) {
    // 客戶登入
    res.json({ 
      loggedIn: true, 
      role: 'customer',
      user_id: req.session.customer_id
    });
  } else {
    res.json({ loggedIn: false });
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