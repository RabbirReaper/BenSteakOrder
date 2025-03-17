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
     * 獲取指定類型的所有餐點
     * @param {string} type - 餐點類型 (mainDish, elseDish, addon, rawMeat)
     * @returns {Promise} - API 響應
     */
    getAll(type) {
      return apiClient.get(`/dish/${type}`);
    },

    /**
     * 根據 ID 獲取特定餐點
     * @param {string} type - 餐點類型 (mainDish, elseDish, addon, rawMeat)
     * @param {string} id - 餐點 ID
     * @returns {Promise} - API 響應
     */
    getById(type, id) {
      return apiClient.get(`/dish/${type}/${id}`);
    },

    /**
     * 創建新餐點
     * @param {string} type - 餐點類型 (mainDish, elseDish, addon, rawMeat)
     * @param {Object} dishData - 餐點數據
     * @returns {Promise} - API 響應
     */
    create(type, dishData) {
      return apiClient.post(`/dish/${type}`, dishData);
    },

    /**
     * 更新餐點
     * @param {string} type - 餐點類型 (mainDish, elseDish, addon, rawMeat)
     * @param {string} id - 餐點 ID
     * @param {Object} dishData - 更新的餐點數據
     * @returns {Promise} - API 響應
     */
    update(type, id, dishData) {
      return apiClient.put(`/dish/${type}/${id}`, dishData);
    },

    /**
     * 刪除餐點
     * @param {string} type - 餐點類型 (mainDish, elseDish, addon, rawMeat)
     * @param {string} id - 餐點 ID
     * @returns {Promise} - API 響應
     */
    delete(type, id) {
      return apiClient.delete(`/dish/${type}/${id}`);
    }
  };
}