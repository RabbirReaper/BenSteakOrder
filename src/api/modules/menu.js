// src/api/modules/menu.js
// 菜單相關 API

/**
 * 菜單 API 模組
 * @param {Object} apiClient - Axios 實例
 * @returns {Object} - 菜單相關 API 方法
 */
export default function(apiClient) {
  return {
    /**
     * 獲取所有菜單
     * @returns {Promise} - API 響應
     */
    getAll() {
      return apiClient.get('/menu');
    },

    /**
     * 根據 ID 獲取菜單
     * @param {string} id - 菜單 ID
     * @returns {Promise} - API 響應
     */
    getById(id) {
      return apiClient.get(`/menu/${id}`);
    },

    /**
     * 創建新菜單
     * @param {Object} menuData - 菜單數據
     * @returns {Promise} - API 響應
     */
    create(menuData) {
      return apiClient.post('/menu', menuData);
    },

    /**
     * 更新菜單
     * @param {string} id - 菜單 ID
     * @param {Object} menuData - 更新的菜單數據
     * @returns {Promise} - API 響應
     */
    update(id, menuData) {
      return apiClient.put(`/menu/${id}`, menuData);
    },

    /**
     * 刪除菜單
     * @param {string} id - 菜單 ID
     * @returns {Promise} - API 響應
     */
    delete(id) {
      return apiClient.delete(`/menu/${id}`);
    }
  };
}