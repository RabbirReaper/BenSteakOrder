// src/api/modules/couponInstance.js
// 優惠券實例相關 API

/**
 * 優惠券實例 API 模組
 * @param {Object} apiClient - Axios 實例
 * @returns {Object} - 優惠券實例相關 API 方法
 */
export default function(apiClient) {
  return {
    /**
     * 獲取客戶的所有優惠券
     * @param {string} customerId - 客戶 ID
     * @returns {Promise} - API 響應
     */
    getByCustomerId(customerId) {
      return apiClient.get(`/couponInstance/customer/${customerId}`);
    },

    /**
     * 獲取當前登入客戶的所有優惠券
     * @returns {Promise} - API 響應
     */
    getMyCoupons() {
      return apiClient.get('/couponInstance/my-coupons');
    },

    /**
     * 根據 ID 獲取優惠券
     * @param {string} id - 優惠券 ID
     * @returns {Promise} - API 響應
     */
    getById(id) {
      return apiClient.get(`/couponInstance/${id}`);
    },

    /**
     * 使用優惠券
     * @param {string} id - 優惠券 ID
     * @param {string} orderId - 訂單 ID
     * @returns {Promise} - API 響應
     */
    useCoupon(id, orderId) {
      return apiClient.put(`/couponInstance/${id}/use`, { orderId });
    },

    /**
     * 購買優惠券
     * @param {string} templateId - 優惠券模板 ID
     * @returns {Promise} - API 響應
     */
    purchase(templateId) {
      return apiClient.post('/couponInstance/purchase', { templateId });
    },

  };
}