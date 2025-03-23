// src/api/modules/pointSystem.js
// 點數系統相關 API

/**
 * 點數系統 API 模組
 * @param {Object} apiClient - Axios 實例
 * @returns {Object} - 點數系統相關 API 方法
 */
export default function(apiClient) {
  return {
    /**
     * 獲取所有點數系統設定
     * @returns {Promise} - API 響應
     */
    getAll() {
      return apiClient.get('/pointSystem');
    },

    /**
     * 根據 ID 獲取點數系統設定
     * @param {string} id - 點數系統 ID
     * @returns {Promise} - API 響應
     */
    getById(id) {
      return apiClient.get(`/pointSystem/${id}`);
    },

    /**
     * 創建新點數系統設定
     * @param {Object} pointSystemData - 點數系統數據
     * @param {string} pointSystemData.name - 名稱
     * @param {number} pointSystemData.minAmount - 最低消費金額
     * @param {string} pointSystemData.formula - 計算公式
     * @param {string} pointSystemData.description - 描述 (可選)
     * @param {boolean} pointSystemData.active - 是否啟用 (可選)
     * @returns {Promise} - API 響應
     */
    create(pointSystemData) {
      return apiClient.post('/pointSystem', pointSystemData);
    },

    /**
     * 更新點數系統啟用狀態
     * @param {string} id - 點數系統 ID
     * @param {boolean} active - 啟用狀態
     * @returns {Promise} - API 響應
     */
    updateStatus(id, active) {
      return apiClient.put(`/pointSystem/${id}`, { active });
    },

    /**
     * 刪除點數系統設定
     * @param {string} id - 點數系統 ID
     * @returns {Promise} - API 響應
     */
    delete(id) {
      return apiClient.delete(`/pointSystem/${id}`);
    },

    /**
     * 測試點數計算公式
     * @param {string} formula - 計算公式
     * @param {number} amount - 消費金額
     * @returns {number} - 計算結果
     */
    testFormula(formula, amount) {
      try {
        // 安全地測試公式
        // 使用 Function 構造函數來創建一個函數，這比 eval 安全
        const x = amount; // 公式中使用 x 作為消費金額
        const calculatePoints = new Function('x', `return ${formula}`);
        return Math.floor(calculatePoints(x));
      } catch (error) {
        console.error('公式計算錯誤:', error);
        return 0;
      }
    }
  };
}