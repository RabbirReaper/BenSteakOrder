// 選項類別相關 API

/**
 * 選項類別 API 模組
 * @param {Object} apiClient - Axios 實例
 * @returns {Object} - 選項類別相關 API 方法
 */
export default function(apiClient) {
  return {
    /**
     * 獲取所有選項類別
     * @returns {Promise} - API 響應
     */
    getAll() {
      return apiClient.get('/optionCategory');
    },

    /**
     * 根據 ID 獲取選項類別
     * @param {string} id - 選項類別 ID
     * @returns {Promise} - API 響應
     */
    getById(id) {
      return apiClient.get(`/optionCategory/${id}`);
    },

    /**
     * 創建新選項類別
     * @param {Object} categoryData - 選項類別數據
     * @param {string} categoryData.name - 名稱
     * @param {string} categoryData.inputType - 輸入類型 ('single' 或 'multiple')
     * @returns {Promise} - API 響應
     */
    create(categoryData) {
      return apiClient.post('/optionCategory', categoryData);
    },

    /**
     * 更新選項類別
     * @param {string} id - 選項類別 ID
     * @param {Object} categoryData - 要更新的數據
     * @param {string} categoryData.name - 名稱
     * @param {string} categoryData.inputType - 輸入類型 ('single' 或 'multiple')
     * @returns {Promise} - API 響應
     */
    update(id, categoryData) {
      return apiClient.put(`/optionCategory/${id}`, categoryData);
    },

    /**
     * 刪除選項類別
     * @param {string} id - 選項類別 ID
     * @returns {Promise} - API 響應
     */
    delete(id) {
      return apiClient.delete(`/optionCategory/${id}`);
    }
  };
}