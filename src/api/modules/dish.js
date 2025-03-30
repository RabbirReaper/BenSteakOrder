// src/api/modules/dish.js
// 餐點相關 API

// src/api/modules/dish.js
// 餐點相關 API

/**
 * 餐點 API 模組
 * @param {Object} apiClient - Axios 實例
 * @returns {Object} - 餐點相關 API 方法
 */
export default function(apiClient) {
  return {
    /**
     * 獲取所有餐點
     * @returns {Promise} - API 響應
     */
    getAll() {
      return apiClient.get('/dish');
    },

    /**
     * 根據 ID 獲取特定餐點
     * @param {string} id - 餐點 ID
     * @returns {Promise} - API 響應
     */
    getById(id) {
      return apiClient.get(`/dish/${id}`);
    },

    /**
     * 創建新餐點
     * @param {Object} dishData - 餐點數據
     * @returns {Promise} - API 響應
     */
    create(dishData) {
      return apiClient.post('/dish', dishData);
    },

    /**
     * 更新餐點
     * @param {string} id - 餐點 ID
     * @param {Object} dishData - 更新的餐點數據
     * @returns {Promise} - API 響應
     */
    update(id, dishData) {
      return apiClient.put(`/dish/${id}`, dishData);
    },

    /**
     * 刪除餐點
     * @param {string} id - 餐點 ID
     * @returns {Promise} - API 響應
     */
    delete(id) {
      return apiClient.delete(`/dish/${id}`);
    }
  };
}