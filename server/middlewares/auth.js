import session from 'express-session';
import Admin from '../models/Users/Admin.js';

// 配置 session
export const configureSession = (app) => {

  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 60 * 1000 // 30 分鐘後過期
    }
  }));
};

// 檢查用戶是否已認證
export const checkAuth = (req, res, next) => {
  // if (!req.session.user_id) {
  //   return res.status(401).send('請先登入');
  // }
  next();
};

// 超級管理員是否登入
export const isSuperAdmin = async (req, res, next) => {
  if (!req.session.user_id) {
    return res.status(401).json({ message: '請先登入' });
  }
  
  try {
    const admin = await Admin.findById(req.session.user_id);
    if (!admin || admin.role !== 'super_admin') {
      return res.status(403).json({ message: '需要超級管理員權限' });
    }
  } catch (error) {
    return res.status(500).json({ message: '伺服器錯誤' });
  }
  return next();
};

// 分店管理員是否登入
export const isStoreAdmin = async (req, res, next) => {
  if (!req.session.user_id) {
    return res.status(401).json({ message: '請先登入' });
  }
  
  try {
    const admin = await Admin.findById(req.session.user_id);
    if (!admin) {
      return res.status(403).json({ message: '需要管理員權限' });
    }
    
    // 超級管理員可以管理所有店鋪
    if (admin.role === 'super_admin') {
      return next();
    }
    
    // 店鋪管理員只能管理自己的店鋪
    const storeId = req.params.storeId || req.body.storeId || req.query.storeId;
    if (admin.role === 'store_admin' && admin.managedStore.toString() === storeId) {
      return next();
    }
    
    return res.status(403).json({ message: '沒有權限管理此店鋪' });
  } catch (error) {
    return res.status(500).json({ message: '伺服器錯誤' });
  }
};

// 顧客是否登入
export const isCustomer = async (req, res, next) => {
  if (!req.session.customer_id) {
    return res.status(401).json({ message: '請先登入' });
  }
  next();
};