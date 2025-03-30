// src/api/modules/stockLog.js
// 庫存日誌相關 API

/**
 * 庫存日誌 API 模組
 * @param {Object} apiClient - Axios 實例
 * @returns {Object} - 庫存日誌相關 API 方法
 */
export default function(apiClient) {
  return {
    /**
     * 獲取特定餐點的庫存日誌
     * @param {string} dishId - 餐點 ID
     * @returns {Promise} - API 響應
     */
    getByDishId(dishId) {
      return apiClient.get(`/stockLog/dish/${dishId}`);
    },

    /**
     * 獲取所有庫存日誌，支援過濾條件
     * @param {Object} filters - 過濾條件
     * @param {Date|string} filters.start - 開始時間
     * @param {Date|string} filters.end - 結束時間
     * @param {string} filters.dishName - 餐點名稱（模糊搜尋）
     * @param {string} filters.changeType - 變動類型
     * @returns {Promise} - API 響應
     */
    getAll(filters = {}) {
      // 構建查詢參數
      const params = {};
      if (filters.start) params.start = filters.start instanceof Date ? filters.start.toISOString() : filters.start;
      if (filters.end) params.end = filters.end instanceof Date ? filters.end.toISOString() : filters.end;
      if (filters.dishName) params.dishName = filters.dishName;
      if (filters.changeType) params.changeType = filters.changeType;
      
      return apiClient.get('/stockLog', { params });
    },

    /**
     * 手動調整庫存
     * @param {string} dishId - 餐點 ID
     * @param {number} adjustAmount - 調整數量（正數為增加，負數為減少）
     * @param {string} reason - 調整原因
     * @returns {Promise} - API 響應
     */
    adjustStock(dishId, adjustAmount, reason) {
      return apiClient.post('/stockLog/adjust', {
        dishId,
        adjustAmount,
        reason
      });
    },

    /**
     * 初始化餐點庫存
     * @param {string} dishId - 餐點 ID
     * @param {number} initialStock - 初始庫存
     * @returns {Promise} - API 響應
     */
    initializeStock(dishId, initialStock) {
      return apiClient.post('/stockLog/initialize', {
        dishId,
        initialStock
      });
    }
  };
}