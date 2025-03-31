// src/api/modules/comboInstance.js
// 套餐實例相關 API

/**
 * 套餐實例 API 模組
 * @param {Object} apiClient - Axios 實例
 * @returns {Object} - 套餐實例相關 API 方法
 */
export default function(apiClient) {
  return {
    /**
     * 獲取所有套餐實例
     * @returns {Promise} - API 響應
     */
    getAll() {
      return apiClient.get('/comboInstance');
    },

    /**
     * 根據訂單 ID 獲取套餐實例
     * @param {string} orderId - 訂單 ID
     * @returns {Promise} - API 響應
     */
    getByOrderId(orderId) {
      return apiClient.get(`/comboInstance/order/${orderId}`);
    },

    /**
     * 根據 ID 獲取套餐實例
     * @param {string} id - 套餐實例 ID
     * @returns {Promise} - API 響應
     */
    getById(id) {
      return apiClient.get(`/comboInstance/${id}`);
    },

    /**
     * 創建新套餐實例
     * @param {Object} instanceData - 套餐實例數據
     * @param {string} instanceData.templateId - 套餐模板 ID
     * @param {Array} instanceData.items - 套餐中的項目
     * @param {string} instanceData.specialInstructions - 特殊要求
     * @param {string} instanceData.order - 關聯訂單 ID
     * @returns {Promise} - API 響應
     */
    create(instanceData) {
      return apiClient.post('/comboInstance', instanceData);
    },

    /**
     * 更新套餐實例
     * @param {string} id - 套餐實例 ID
     * @param {Object} instanceData - 更新的套餐實例數據
     * @returns {Promise} - API 響應
     */
    update(id, instanceData) {
      return apiClient.put(`/comboInstance/${id}`, instanceData);
    },

    /**
     * 刪除套餐實例
     * @param {string} id - 套餐實例 ID
     * @returns {Promise} - API 響應
     */
    delete(id) {
      return apiClient.delete(`/comboInstance/${id}`);
    },

    /**
     * 為訂單創建多個套餐實例
     * @param {Array} instances - 套餐實例數組
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