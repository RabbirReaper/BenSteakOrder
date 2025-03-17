// src/api/modules/store.js
// 店家相關 API

/**
 * 店家 API 模組
 * @param {Object} apiClient - Axios 實例
 * @returns {Object} - 店家相關 API 方法
 */
export default function(apiClient) {
  return {
    /**
     * 獲取所有店家
     * @returns {Promise} - API 響應
     */
    getAll() {
      return apiClient.get('/store');
    },

    /**
     * 根據 ID 獲取店家
     * @param {string} id - 店家 ID
     * @returns {Promise} - API 響應，包含菜單資料
     */
    getById(id) {
      return apiClient.get(`/store/${id}`);
    },

    /**
     * 創建新店家
     * @param {Object} storeData - 店家數據
     * @returns {Promise} - API 響應
     */
    create(storeData) {
      return apiClient.post('/store', storeData);
    },

    /**
     * 更新店家
     * @param {string} id - 店家 ID
     * @param {Object} storeData - 更新的店家數據
     * @returns {Promise} - API 響應
     */
    update(id, storeData) {
      return apiClient.put(`/store/${id}`, storeData);
    },

    /**
     * 刪除店家
     * @param {string} id - 店家 ID
     * @returns {Promise} - API 響應
     */
    delete(id) {
      return apiClient.delete(`/store/${id}`);
    }
  };
}