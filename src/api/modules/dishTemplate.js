// 餐點模板相關 API

/**
 * 餐點模板 API 模組
 * @param {Object} apiClient - Axios 實例
 * @returns {Object} - 餐點模板相關 API 方法
 */
export default function(apiClient) {
  return {
    /**
     * 獲取所有餐點模板
     * @returns {Promise} - API 響應
     */
    getAll() {
      return apiClient.get('/dishTemplate');
    },

    /**
     * 根據 ID 獲取餐點模板
     * @param {string} id - 餐點模板 ID
     * @returns {Promise} - API 響應
     */
    getById(id) {
      return apiClient.get(`/dishTemplate/${id}`);
    },

    /**
     * 創建新餐點模板
     * @param {Object} templateData - 餐點模板數據
     * @returns {Promise} - API 響應
     */
    create(templateData) {
      return apiClient.post('/dishTemplate', templateData);
    },

    /**
     * 更新餐點模板
     * @param {string} id - 餐點模板 ID
     * @param {Object} templateData - 更新的餐點模板數據
     * @returns {Promise} - API 響應
     */
    update(id, templateData) {
      return apiClient.put(`/dishTemplate/${id}`, templateData);
    },

    /**
     * 更新餐點庫存
     * @param {string} id - 餐點模板 ID
     * @param {number} actualStock - 實際庫存
     * @param {number} displayStock - 顯示庫存
     * @param {string} reason - 調整原因
     * @returns {Promise} - API 響應
     */
    updateStock(id, actualStock, displayStock, reason) {
      return apiClient.put(`/dishTemplate/${id}/stock`, {
        actualStock,
        displayStock,
        reason
      });
    },

    /**
     * 刪除餐點模板
     * @param {string} id - 餐點模板 ID
     * @returns {Promise} - API 響應
     */
    delete(id) {
      return apiClient.delete(`/dishTemplate/${id}`);
    }
  };
}