import session from 'express-session';

// 檢查用戶是否已認證
export const checkAuth = (req, res, next) => {
  if (!req.session.user_id) {
    return res.status(401).send('Unauthorized');
  }
  next();
};

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