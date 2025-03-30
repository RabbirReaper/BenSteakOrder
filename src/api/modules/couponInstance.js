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

    /**
     * 檢查優惠券是否可用於特定商品
     * @param {Object} coupon - 優惠券實例
     * @param {Object} item - 商品資料，需要有 _id 和 __t (型別) 屬性
     * @returns {boolean} - 是否可用
     */
    isApplicableToItem(coupon, item) {
      // 如果優惠券已使用或過期，則不可用
      if (coupon.isUsed || new Date(coupon.expireAt) < new Date()) {
        return false;
      }
      
      // 如果不是折扣券，則不適用於商品
      if (coupon.type !== 'discount') {
        return false;
      }
      
      // 如果沒有設置適用商品，則適用於所有商品
      if (!coupon.admitItems || coupon.admitItems.length === 0) {
        return true;
      }
      
      // 檢查商品是否在適用清單中
      return coupon.admitItems.some(admitItem => 
        admitItem.itemModel === item.__t && admitItem.itemId.toString() === item._id.toString()
      );
    },

    /**
     * 計算應用優惠券後的價格
     * @param {Object} coupon - 優惠券實例
     * @param {number} originalPrice - 原始價格
     * @returns {number} - 折扣後價格
     */
    calculateDiscountedPrice(coupon, originalPrice) {
      if (coupon.type !== 'discount' || coupon.isUsed || new Date(coupon.expireAt) < new Date()) {
        return originalPrice;
      }
      
      // 應用折扣
      const discountedPrice = originalPrice - coupon.discount;
      
      // 確保價格不為負數
      return Math.max(discountedPrice, 0);
    }
  };
}