// src/api/modules/combo.js
// 套餐相關 API

/**
 * 套餐 API 模組
 * @param {Object} apiClient - Axios 實例
 * @returns {Object} - 套餐相關 API 方法
 */
export default function(apiClient) {
  return {
    /**
     * 獲取所有套餐
     * @returns {Promise} - API 響應
     */
    getAll() {
      return apiClient.get('/combo');
    },

    /**
     * 根據 ID 獲取套餐
     * @param {string} id - 套餐 ID
     * @returns {Promise} - API 響應
     */
    getById(id) {
      return apiClient.get(`/combo/${id}`);
    },

    /**
     * 創建新套餐
     * @param {Object} comboData - 套餐數據
     * @param {string} comboData.name - 名稱
     * @param {Array} comboData.dishes - 餐點組合
     * @param {number} comboData.comboPrice - 套餐價格
     * @param {string} comboData.description - 描述
     * @param {Object} comboData.image - 圖片資訊
     * @returns {Promise} - API 響應
     */
    create(comboData) {
      return apiClient.post('/combo', comboData);
    },

    /**
     * 更新套餐
     * @param {string} id - 套餐 ID
     * @param {Object} comboData - 要更新的數據
     * @param {string} comboData.name - 名稱
     * @param {Array} comboData.dishes - 餐點組合
     * @param {number} comboData.comboPrice - 套餐價格
     * @param {string} comboData.description - 描述
     * @param {Object} comboData.image - 圖片資訊
     * @returns {Promise} - API 響應
     */
    update(id, comboData) {
      return apiClient.put(`/combo/${id}`, comboData);
    },

    /**
     * 刪除套餐
     * @param {string} id - 套餐 ID
     * @returns {Promise} - API 響應
     */
    delete(id) {
      return apiClient.delete(`/combo/${id}`);
    },

    /**
     * 上傳套餐圖片
     * @param {File} file - 圖片檔案
     * @returns {Promise} - API 響應
     */
    async uploadImage(file) {
      // 先將文件轉換為 Base64 格式
      const base64Image = await this.fileToBase64(file);
      
      // 使用圖片 API 上傳
      return apiClient.post('/image', { image: base64Image });
    },

    /**
     * 將文件轉換為 Base64 格式
     * @param {File} file - 檔案對象
     * @returns {Promise<string>} - Base64 編碼的圖片數據
     */
    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  };
}