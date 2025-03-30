// 餐點實例相關 API

/**
 * 餐點實例 API 模組
 * @param {Object} apiClient - Axios 實例
 * @returns {Object} - 餐點實例相關 API 方法
 */
export default function(apiClient) {
  return {
    /**
     * 獲取所有餐點實例
     * @returns {Promise} - API 響應
     */
    getAll() {
      return apiClient.get('/dishInstance');
    },

    /**
     * 根據訂單 ID 獲取餐點實例
     * @param {string} orderId - 訂單 ID
     * @returns {Promise} - API 響應
     */
    getByOrderId(orderId) {
      return apiClient.get(`/dishInstance/order/${orderId}`);
    },

    /**
     * 根據 ID 獲取餐點實例
     * @param {string} id - 餐點實例 ID
     * @returns {Promise} - API 響應
     */
    getById(id) {
      return apiClient.get(`/dishInstance/${id}`);
    },

    /**
     * 創建新餐點實例
     * @param {Object} instanceData - 餐點實例數據
     * @param {string} instanceData.templateId - 餐點模板 ID
     * @param {Array} instanceData.options - 選項設定
     * @param {string} instanceData.specialInstructions - 特殊要求
     * @param {string} instanceData.order - 關聯訂單 ID
     * @returns {Promise} - API 響應
     */
    create(instanceData) {
      return apiClient.post('/dishInstance', instanceData);
    },

    /**
     * 更新餐點實例
     * @param {string} id - 餐點實例 ID
     * @param {Object} instanceData - 更新的餐點實例數據
     * @returns {Promise} - API 響應
     */
    update(id, instanceData) {
      return apiClient.put(`/dishInstance/${id}`, instanceData);
    },

    /**
     * 刪除餐點實例
     * @param {string} id - 餐點實例 ID
     * @returns {Promise} - API 響應
     */
    delete(id) {
      return apiClient.delete(`/dishInstance/${id}`);
    },

    /**
     * 為訂單創建多個餐點實例
     * @param {Array} instances - 餐點實例數組
     * @param {string} orderId - 訂單 ID
     * @returns {Promise} - 完成所有創建的 Promise
     */
    createMultipleForOrder(instances, orderId) {
      const promises = instances.map(instance => {
        return this.create({
          ...instance,
          order: orderId
        });
      });
      
      return Promise.all(promises);
    }
  };
}