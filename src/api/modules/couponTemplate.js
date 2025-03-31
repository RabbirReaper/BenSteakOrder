// 優惠券模板相關 API

/**
 * 優惠券模板 API 模組
 * @param {Object} apiClient - Axios 實例
 * @returns {Object} - 優惠券模板相關 API 方法
 */
export default function(apiClient) {
  return {
    /**
     * 獲取所有優惠券模板
     * @returns {Promise} - API 響應
     */
    getAll() {
      return apiClient.get('/couponTemplate');
    },

    /**
     * 根據 ID 獲取優惠券模板
     * @param {string} id - 優惠券模板 ID
     * @returns {Promise} - API 響應
     */
    getById(id) {
      return apiClient.get(`/couponTemplate/${id}`);
    },

    /**
     * 創建新優惠券模板
     * @param {Object} templateData - 優惠券模板數據
     * @param {string} templateData.name - 名稱
     * @param {string} templateData.type - 類型 ('discount' 或 'exchange')
     * @param {number} templateData.discount - 折扣金額 (type 為 'discount' 時必填)
     * @param {Object} templateData.exchangeItem - 兌換商品 (type 為 'exchange' 時必填)
     * @param {Array} templateData.admitItems - 適用商品清單 (折扣券可用)
     * @param {string} templateData.description - 描述
     * @param {number} templateData.price - 價格
     * @param {boolean} templateData.active - 是否上架
     * @param {Date|string} templateData.startAt - 上架開始日期
     * @param {Date|string} templateData.endAt - 上架結束日期
     * @param {number} templateData.stock - 庫存 (-1 表示無限制)
     * @returns {Promise} - API 響應
     */
    create(templateData) {
      return apiClient.post('/couponTemplate', templateData);
    },

    /**
     * 更新優惠券模板
     * @param {string} id - 優惠券模板 ID
     * @param {Object} templateData - 要更新的數據
     * @returns {Promise} - API 響應
     */
    update(id, templateData) {
      return apiClient.put(`/couponTemplate/${id}`, templateData);
    },

    /**
     * 刪除優惠券模板
     * @param {string} id - 優惠券模板 ID
     * @returns {Promise} - API 響應
     */
    delete(id) {
      return apiClient.delete(`/couponTemplate/${id}`);
    },

    /**
     * 發放優惠券給特定客戶
     * @param {string} templateId - 優惠券模板 ID
     * @param {string} customerId - 客戶 ID
     * @param {string} acquisitionMethod - 獲取方式 ('purchase' 或 'activity')
     * @returns {Promise} - API 響應
     */
    issueCoupon(templateId, customerId, acquisitionMethod = 'activity') {
      return apiClient.post('/couponTemplate/issue', {
        templateId,
        customerId,
        acquisitionMethod
      });
    }
  };
}