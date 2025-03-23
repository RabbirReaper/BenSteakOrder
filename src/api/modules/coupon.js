// src/api/modules/coupon.js
// 優惠券相關 API

/**
 * 優惠券 API 模組
 * @param {Object} apiClient - Axios 實例
 * @returns {Object} - 優惠券相關 API 方法
 */
export default function(apiClient) {
  return {
    /**
     * 獲取所有優惠券
     * @returns {Promise} - API 響應
     */
    getAll() {
      return apiClient.get('/coupon');
    },

    /**
     * 根據 ID 獲取優惠券
     * @param {string} id - 優惠券 ID
     * @returns {Promise} - API 響應
     */
    getById(id) {
      return apiClient.get(`/coupon/${id}`);
    },

    /**
     * 創建新優惠券
     * @param {Object} couponData - 優惠券數據
     * @param {string} couponData.name - 名稱
     * @param {string} couponData.type - 類型 ('discount' 或 'exchange')
     * @param {number} couponData.discount - 折扣金額 (type 為 'discount' 時必填)
     * @param {Object} couponData.items - 兌換商品 (type 為 'exchange' 時必填)
     * @param {string} couponData.items.itemModel - 商品模型類型
     * @param {string} couponData.items.itemId - 商品 ID
     * @param {number} couponData.items.amount - 商品數量 (預設為 1)
     * @param {string} couponData.description - 描述 (可選)
     * @param {boolean} couponData.active - 是否啟用 (可選)
     * @param {Date|string} couponData.startAt - 起始日期 (可選)
     * @param {Date|string} couponData.expireAt - 到期日期 (可選)
     * @returns {Promise} - API 響應
     */
    create(couponData) {
      return apiClient.post('/coupon', couponData);
    },

    /**
     * 更新優惠券
     * @param {string} id - 優惠券 ID
     * @param {Object} couponData - 要更新的優惠券數據
     * @returns {Promise} - API 響應
     */
    update(id, couponData) {
      return apiClient.put(`/coupon/${id}`, couponData);
    },

    /**
     * 刪除優惠券
     * @param {string} id - 優惠券 ID
     * @returns {Promise} - API 響應
     */
    delete(id) {
      return apiClient.delete(`/coupon/${id}`);
    }
  };
}