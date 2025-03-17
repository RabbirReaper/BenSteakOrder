// src/api/modules/order.js
// 訂單相關 API

/**
 * 訂單 API 模組
 * @param {Object} apiClient - Axios 實例
 * @returns {Object} - 訂單相關 API 方法
 */
export default function(apiClient) {
  return {
    /**
     * 根據時間範圍獲取訂單
     * @param {Date} startDate - 開始時間
     * @param {Date} endDate - 結束時間
     * @returns {Promise} - API 響應
     */
    getByTimeRange(startDate, endDate) {
      return apiClient.get('/order', {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      });
    },

    /**
     * 獲取特定店家在特定時間段的訂單
     * @param {string} storeId - 店家 ID
     * @param {Date} startDate - 開始時間
     * @param {Date} endDate - 結束時間
     * @returns {Promise} - API 響應
     */
    getStoreOrdersByTimeRange(storeId, startDate, endDate) {
      return apiClient.get(`/order/order/${storeId}`, {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      });
    },

    /**
     * 獲取今日特定店家的訂單
     * @param {string} storeId - 店家 ID
     * @returns {Promise} - API 響應
     */
    getTodayStoreOrders(storeId) {
      return apiClient.get(`/order/today/${storeId}`);
    },

    /**
     * 獲取訂單流水號
     * @returns {Promise} - API 響應
     */
    getOrderNumber() {
      return apiClient.get('/order/number');
    },

    /**
     * 根據 ID 獲取單個訂單
     * @param {string} id - 訂單 ID
     * @returns {Promise} - API 響應
     */
    getById(id) {
      return apiClient.get(`/order/${id}`);
    },

    /**
     * 創建訂單
     * @param {Object} orderData - 訂單數據
     * @returns {Promise} - API 響應
     */
    create(orderData) {
      return apiClient.post('/order', orderData);
    },

    /**
     * 更新訂單
     * @param {string} id - 訂單 ID
     * @param {Object} orderData - 更新的訂單數據
     * @returns {Promise} - API 響應
     */
    update(id, orderData) {
      return apiClient.put(`/order/${id}`, orderData);
    },

    /**
     * 更新訂單狀態
     * @param {string} id - 訂單 ID
     * @param {string} status - 新狀態 ('Unpaid', 'Completed', 'Canceled')
     * @param {string} paymentMethod - 付款方式 (可選)
     * @returns {Promise} - API 響應
     */
    updateStatus(id, status, paymentMethod) {
      const updateData = { orderStatus: status };
      if (paymentMethod) {
        updateData.paymentMethod = paymentMethod;
      }
      return apiClient.put(`/order/${id}`, updateData);
    }
  };
}