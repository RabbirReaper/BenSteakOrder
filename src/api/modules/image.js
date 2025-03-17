// src/api/modules/image.js
// 圖片上傳相關 API

/**
 * 圖片 API 模組
 * @param {Object} apiClient - Axios 實例
 * @returns {Object} - 圖片相關 API 方法
 */
export default function(apiClient) {
  return {
    /**
     * 上傳圖片
     * @param {string} base64Image - Base64 編碼的圖片數據
     * @returns {Promise} - API 響應，包含圖片上傳後的資訊
     */
    upload(base64Image) {
      return apiClient.post('/image', { image: base64Image });
    },

    /**
     * 修改圖片
     * @param {string} publicId - 圖片公共 ID
     * @param {string} base64Image - 新的 Base64 編碼圖片數據
     * @returns {Promise} - API 響應
     */
    modify(publicId, base64Image) {
      return apiClient.put('/image', {
        publicId,
        newImage: base64Image
      });
    },

    /**
     * 刪除圖片
     * @param {string} publicId - 圖片公共 ID
     * @returns {Promise} - API 響應
     */
    delete(publicId) {
      return apiClient.delete('/image', {
        data: { publicId }
      });
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