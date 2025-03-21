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
     * 管理員登入
     * @param {string} name - 管理員用戶名
     * @param {string} password - 密碼
     * @returns {Promise} - API 響應
     */
    adminLogin(name, password) {
      return apiClient.post('/auth/admin/login', { name, password });
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
    },

    /**
     * 創建新管理員（僅限超級管理員）
     * @param {string} name - 新管理員用戶名
     * @param {string} password - 密碼
     * @param {string} role - 角色 ('super_admin' 或 'store_admin')
     * @param {string} managedStore - 管理的店家ID (僅對 store_admin 角色需要)
     * @returns {Promise} - API 響應
     */
    createAdmin(name, password, role, managedStore) {
      return apiClient.post('/auth/createAdmin', { 
        name, 
        password,
        role,
        managedStore
      });
    },

    /**
     * 刪除管理員（僅限超級管理員）
     * @param {string} id - 要刪除的管理員ID
     * @returns {Promise} - API 響應
     */
    deleteAdmin(id) {
      return apiClient.delete(`/auth/deleteUser/${id}`);
    }
  };
}