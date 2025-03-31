// 選項相關 API

/**
 * 選項 API 模組
 * @param {Object} apiClient - Axios 實例
 * @returns {Object} - 選項相關 API 方法
 */
export default function(apiClient) {
  return {
    /**
     * 獲取所有選項
     * @param {string} [categoryId] - 可選的類別 ID 過濾
     * @returns {Promise} - API 響應
     */
    getAll(categoryId) {
      const params = {};
      if (categoryId) params.categoryId = categoryId;
      
      return apiClient.get('/option', { params });
    },

    /**
     * 根據 ID 獲取選項
     * @param {string} id - 選項 ID
     * @returns {Promise} - API 響應
     */
    getById(id) {
      return apiClient.get(`/option/${id}`);
    },

    /**
     * 創建新選項
     * @param {Object} optionData - 選項數據
     * @param {string} optionData.name - 名稱
     * @param {number} optionData.price - 價格
     * @param {number} optionData.order - 排序
     * @param {string} optionData.category - 類別 ID
     * @returns {Promise} - API 響應
     */
    create(optionData) {
      return apiClient.post('/option', optionData);
    },

    /**
     * 更新選項
     * @param {string} id - 選項 ID
     * @param {Object} optionData - 要更新的數據
     * @param {string} optionData.name - 名稱
     * @param {number} optionData.price - 價格
     * @param {number} optionData.order - 排序
     * @param {string} optionData.category - 類別 ID
     * @returns {Promise} - API 響應
     */
    update(id, optionData) {
      return apiClient.put(`/option/${id}`, optionData);
    },

    /**
     * 批量更新選項排序
     * @param {Array} orderUpdates - 排序更新數組
     * @param {string} orderUpdates[].id - 選項 ID
     * @param {number} orderUpdates[].order - 新排序值
     * @returns {Promise} - API 響應
     */
    updateBatchOrder(orderUpdates) {
      return apiClient.put('/option/batch/order', { orderUpdates });
    },

    /**
     * 刪除選項
     * @param {string} id - 選項 ID
     * @returns {Promise} - API 響應
     */
    delete(id) {
      return apiClient.delete(`/option/${id}`);
    }
  };
}