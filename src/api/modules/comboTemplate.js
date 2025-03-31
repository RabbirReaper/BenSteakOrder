// src/api/modules/comboTemplate.js
// 套餐模板相關 API

/**
 * 套餐模板 API 模組
 * @param {Object} apiClient - Axios 實例
 * @returns {Object} - 套餐模板相關 API 方法
 */
export default function(apiClient) {
  return {
    /**
     * 獲取所有套餐模板
     * @returns {Promise} - API 響應
     */
    getAll() {
      return apiClient.get('/comboTemplate');
    },

    /**
     * 根據 ID 獲取套餐模板
     * @param {string} id - 套餐模板 ID
     * @returns {Promise} - API 響應
     */
    getById(id) {
      return apiClient.get(`/comboTemplate/${id}`);
    },

    /**
     * 創建新套餐模板
     * @param {Object} templateData - 套餐模板數據
     * @param {string} templateData.name - 名稱
     * @param {Array} templateData.dishes - 餐點組合
     * @param {number} templateData.basePrice - 套餐價格
     * @param {string} templateData.description - 描述
     * @param {Object} templateData.image - 圖片資訊
     * @param {boolean} templateData.isAvailable - 是否可用
     * @param {number} templateData.actualStock - 實際庫存
     * @param {number} templateData.displayStock - 顯示庫存
     * @returns {Promise} - API 響應
     */
    create(templateData) {
      return apiClient.post('/comboTemplate', templateData);
    },

    /**
     * 更新套餐模板
     * @param {string} id - 套餐模板 ID
     * @param {Object} templateData - 要更新的數據
     * @param {string} templateData.name - 名稱
     * @param {Array} templateData.dishes - 餐點組合
     * @param {number} templateData.basePrice - 套餐價格
     * @param {string} templateData.description - 描述
     * @param {Object} templateData.image - 圖片資訊
     * @param {boolean} templateData.isAvailable - 是否可用
     * @returns {Promise} - API 響應
     */
    update(id, templateData) {
      return apiClient.put(`/comboTemplate/${id}`, templateData);
    },

    /**
     * 更新套餐庫存
     * @param {string} id - 套餐模板 ID
     * @param {number} actualStock - 實際庫存
     * @param {number} displayStock - 顯示庫存
     * @param {string} reason - 調整原因
     * @returns {Promise} - API 響應
     */
    updateStock(id, actualStock, displayStock, reason) {
      return apiClient.put(`/comboTemplate/${id}/stock`, {
        actualStock,
        displayStock,
        reason
      });
    },

    /**
     * 刪除套餐模板
     * @param {string} id - 套餐模板 ID
     * @returns {Promise} - API 響應
     */
    delete(id) {
      return apiClient.delete(`/comboTemplate/${id}`);
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