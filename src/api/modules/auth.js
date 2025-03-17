// src/api/modules/auth.js
// 認證相關 API

/**
 * 認證 API 模組
 * @param {Object} apiClient - Axios 實例
 * @returns {Object} - 認證相關 API 方法
 */
export default function(apiClient) {
  return {
    /**
     * 用戶登入
     * @param {string} name - 用戶名
     * @param {string} password - 密碼
     * @returns {Promise} - API 響應
     */
    login(name, password) {
      return apiClient.post('/auth/login', { name, password });
    },

    /**
     * 用戶登出
     * @returns {Promise} - API 響應
     */
    logout() {
      return apiClient.post('/auth/logout');
    },

    /**
     * 獲取當前登入用戶信息
     * @returns {Promise} - API 響應
     */
    getCurrentUser() {
      return apiClient.get('/auth/current_user');
    },

    /**
     * 檢查登入狀態
     * @returns {Promise<boolean>} - 是否已登入
     */
    async checkLoginStatus() {
      try {
        const response = await apiClient.get('/auth/current_user');
        return response.data.loggedIn;
      } catch (error) {
        console.error('檢查登入狀態失敗:', error);
        return false;
      }
    }
  };
}