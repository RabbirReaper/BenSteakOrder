// src/api/index.js
// API 主入口

import axios from 'axios';
import dishApi from './modules/dish';
import menuApi from './modules/menu';
import storeApi from './modules/store';
import orderApi from './modules/order';
import authApi from './modules/auth';
import imageApi from './modules/image';

// 獲取 API 基礎 URL，從環境變數或默認值
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// 創建基本 axios 實例，用於整個應用程序
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器，可以用於添加身份驗證令牌等
apiClient.interceptors.request.use(
  (config) => {
    // 在此處添加任何請求處理邏輯
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器，用於統一處理響應
apiClient.interceptors.response.use(
  (response) => {
    // 在此處添加任何響應處理邏輯
    return response;
  },
  (error) => {
    // 統一錯誤處理
    console.error('API 請求錯誤:', error);
    return Promise.reject(error);
  }
);

// 導出所有 API 模塊
export default {
  dish: dishApi(apiClient),
  menu: menuApi(apiClient),
  store: storeApi(apiClient),
  order: orderApi(apiClient),
  auth: authApi(apiClient),
  image: imageApi(apiClient),
  // 導出 axios 實例，方便直接使用
  client: apiClient,
};