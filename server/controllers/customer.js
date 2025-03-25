import bcrypt from 'bcrypt';
import Customer from '../models/Users/Customer.js';

// 客戶登入
export const customerLogin = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const customer = await Customer.findOne({ phoneNumber });

    if (!customer) {
      return res.status(401).json({ success: false, message: '電話號碼或密碼錯誤' });
    }

    const validPassword = await bcrypt.compare(password, customer.password);
    if (validPassword) {
      req.session.customer_id = customer._id;
      req.session.role = 'customer';
      return res.json({
        success: true,
        name: customer.name
      });
    } else {
      return res.json({
        success: false,
        message: '電話號碼或密碼錯誤'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 客戶註冊
export const customerRegister = async (req, res) => {
  try {
    const { name, phoneNumber, password, birthday, gender, address } = req.body;

    // 檢查必填欄位
    if (!name || !phoneNumber) {
      return res.status(400).json({ success: false, message: '姓名和電話號碼為必填欄位' });
    }

    // 檢查電話號碼是否已存在
    const existingCustomer = await Customer.findOne({ phoneNumber });
    if (existingCustomer) {
      return res.status(400).json({ success: false, message: '此電話號碼已被註冊' });
    }

    // 密碼加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || phoneNumber, salt); // 如果沒有密碼，預設為電話號碼

    // 創建新客戶
    const newCustomer = new Customer({
      name,
      phoneNumber,
      password: hashedPassword,
      birthday: birthday ? new Date(birthday) : undefined,
      gender: gender || undefined,
      address: address || undefined
    });

    await newCustomer.save();
    res.status(201).json({ success: true, message: '註冊成功' });
  } catch (error) {
    console.error('Customer registration error:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 檢查電話號碼是否已註冊
export const checkPhoneExists = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: '電話號碼為必填參數' });
    }

    const customer = await Customer.findOne({ phoneNumber });

    return res.json({
      success: true,
      exists: !!customer
    });
  } catch (error) {
    console.error('Check phone error:', error);
    return res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 獲取客戶資料
export const getCustomerProfile = async (req, res) => {
  try {
    if (!req.session.customer_id) {
      return res.status(401).json({ success: false, message: '請先登入' });
    }

    const customer = await Customer.findById(req.session.customer_id)
      .select('-password') // 不返回密碼欄位
      .populate('coupons');

    if (!customer) {
      return res.status(404).json({ success: false, message: '找不到客戶資料' });
    }

    res.json({
      success: true,
      profile: customer
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 更新客戶資料
export const updateCustomerProfile = async (req, res) => {
  try {
    if (!req.session.customer_id) {
      return res.status(401).json({ success: false, message: '請先登入' });
    }

    const { name, birthday, gender, address } = req.body;

    // 驗證資料
    if (!name) {
      return res.status(400).json({ success: false, message: '姓名為必填欄位' });
    }

    // 更新資料
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.session.customer_id,
      {
        name,
        birthday: birthday ? new Date(birthday) : undefined,
        gender: gender || undefined,
        address: address || undefined
      },
      { new: true }
    ).select('-password');

    if (!updatedCustomer) {
      return res.status(404).json({ success: false, message: '找不到客戶資料' });
    }

    res.json({
      success: true,
      profile: updatedCustomer
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 修改密碼
export const changePassword = async (req, res) => {
  try {
    if (!req.session.customer_id) {
      return res.status(401).json({ success: false, message: '請先登入' });
    }

    const { currentPassword, newPassword } = req.body;

    // 驗證資料
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: '目前密碼和新密碼為必填欄位' });
    }

    // 檢查密碼長度
    if (newPassword.length < 8 || newPassword.length > 32) {
      return res.status(400).json({ success: false, message: '密碼長度必須為 8-32 個字元' });
    }

    // 查找用戶
    const customer = await Customer.findById(req.session.customer_id);
    if (!customer) {
      return res.status(404).json({ success: false, message: '找不到客戶資料' });
    }

    // 驗證目前密碼
    const validPassword = currentPassword === customer.password || await bcrypt.compare(currentPassword, customer.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: '目前密碼不正確' });
    }

    // 加密新密碼
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 更新密碼
    customer.password = hashedPassword;
    await customer.save();

    res.json({ success: true, message: '密碼修改成功' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 重設密碼（忘記密碼流程）
export const resetPassword = async (req, res) => {
  try {
    const { phoneNumber, newPassword } = req.body;

    // 驗證資料
    if (!phoneNumber || !newPassword) {
      return res.status(400).json({ success: false, message: '電話號碼和新密碼為必填欄位' });
    }

    // 檢查密碼長度
    if (newPassword.length < 8 || newPassword.length > 32) {
      return res.status(400).json({ success: false, message: '密碼長度必須為 8-32 個字元' });
    }

    // 查找用戶
    const customer = await Customer.findOne({ phoneNumber });
    if (!customer) {
      return res.status(404).json({ success: false, message: '找不到客戶資料' });
    }

    // 加密新密碼
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 更新密碼
    customer.password = hashedPassword;
    await customer.save();

    res.json({ success: true, message: '密碼重設成功' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// 獲取客戶訂單
export const getCustomerOrders = async (req, res) => {
  try {
    if (!req.session.customer_id) {
      return res.status(401).json({ success: false, message: '請先登入' });
    }

    const customer = await Customer.findById(req.session.customer_id)
      .populate({
        path: 'orders',
        populate: [
          { path: 'store' },
          {
            path: 'items.itemId',
          }
        ],
        options: { sort: { createdAt: -1 } } // 按訂單建立時間降序排序
      });

    if (!customer) {
      return res.status(404).json({ success: false, message: '找不到客戶資料' });
    }

    res.json({
      success: true,
      orders: customer.orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};