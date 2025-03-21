// src/api/modules/customer.js
// 客戶相關 API

/**
 * 客戶 API 模組
 * @param {Object} apiClient - Axios 實例
 * @returns {Object} - 客戶相關 API 方法
 */
export default function (apiClient) {
  return {
    /**
     * 客戶登入
     * @param {string} phoneNumber - 客戶電話號碼
     * @param {string} password - 密碼
     * @returns {Promise} - API 響應
     */
    login(phoneNumber, password) {
      return apiClient.post('/customer/login', { phoneNumber, password });
    },

    /**
     * 客戶註冊
     * @param {string} name - 客戶姓名
     * @param {string} phoneNumber - 客戶電話號碼
     * @param {string} password - 密碼
     * @param {string|Date} birthday - 生日 (可選，ISO 日期字串格式 YYYY-MM-DD 或 Date 物件)
     * @param {string} gender - 性別 (可選)
     * @param {string} address - 地址 (可選)
     * @returns {Promise} - API 響應
     */
    register(name, phoneNumber, password, birthday, gender, address) {
      // 確保日期格式正確 - 如果是 Date 物件，轉換為 ISO 字串
      const formattedBirthday = birthday instanceof Date ?
        birthday.toISOString().split('T')[0] : birthday;

      return apiClient.post('/customer/register', {
        name,
        phoneNumber,
        password,
        birthday: formattedBirthday,
        gender,
        address
      });
    },

    /**
     * 檢查電話號碼是否已註冊
     * @param {string} phoneNumber - 電話號碼
     * @returns {Promise} - API 響應
     */
    checkPhoneExists(phoneNumber) {
      return apiClient.get(`/customer/check-phone/${phoneNumber}`);
    },

    /**
     * 獲取客戶個人資料
     * @returns {Promise} - API 響應
     */
    getProfile() {
      return apiClient.get('/customer/profile');
    },

    /**
     * 更新客戶個人資料
     * @param {Object} profileData - 要更新的個人資料
     * @param {string} profileData.name - 客戶姓名
     * @param {string|Date} profileData.birthday - 生日 (可選，ISO 日期字串格式 YYYY-MM-DD 或 Date 物件)
     * @param {string} profileData.gender - 性別 (可選)
     * @param {string} profileData.address - 地址 (可選)
     * @returns {Promise} - API 響應
     */
    updateProfile(profileData) {
      // 複製資料以避免修改原始物件
      const formattedData = { ...profileData };

      // 確保日期格式正確 - 如果是 Date 物件，轉換為 ISO 字串
      if (formattedData.birthday instanceof Date) {
        formattedData.birthday = formattedData.birthday.toISOString().split('T')[0];
      }

      return apiClient.put('/customer/profile', formattedData);
    },

    /**
     * 修改密碼
     * @param {string} currentPassword - 目前密碼
     * @param {string} newPassword - 新密碼
     * @returns {Promise} - API 響應
     */
    changePassword(currentPassword, newPassword) {
      return apiClient.put('/customer/change-password', {
        currentPassword,
        newPassword
      });
    },

    /**
     * 重設密碼 (忘記密碼流程)
     * @param {string} phoneNumber - 客戶電話號碼
     * @param {string} newPassword - 新密碼
     * @returns {Promise} - API 響應
     */
    resetPassword(phoneNumber, newPassword) {
      return apiClient.post('/customer/reset-password', {
        phoneNumber,
        newPassword
      });
    },

    /**
     * 獲取客戶訂單列表
     * @returns {Promise} - API 響應
     */
    getOrders() {
      return apiClient.get('/customer/orders');
    },

    // /**
    //  * 模擬發送簡訊驗證碼
    //  * @param {string} phoneNumber - 客戶電話號碼
    //  * @returns {Promise} - API 響應
    //  */
    // sendVerificationCode(phoneNumber) {
    //   // 注意：這個 API 端點可能不存在，這裡只是一個假設的示例
    //   // 實際上可能需要在後端添加相應的端點
    //   return apiClient.post('/customer/send-verification', { phoneNumber });
    // },

    // /**
    //  * 驗證簡訊驗證碼
    //  * @param {string} phoneNumber - 客戶電話號碼
    //  * @param {string} code - 驗證碼
    //  * @returns {Promise} - API 響應
    //  */
    // verifyCode(phoneNumber, code) {
    //   // 注意：這個 API 端點可能不存在，這裡只是一個假設的示例
    //   // 實際上可能需要在後端添加相應的端點
    //   return apiClient.post('/customer/verify-code', { phoneNumber, code });
    // }
  };
}