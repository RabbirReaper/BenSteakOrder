<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">犇野牛排管理系統</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="alert alert-danger" v-if="authState.error">{{ authState.error }}</div>
        
        <div class="form-group">
          <label for="username">管理員帳號</label>
          <input 
            type="text" 
            id="username" 
            v-model="authState.username" 
            class="form-control" 
            :disabled="authState.loading"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">密碼</label>
          <div class="password-field">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="authState.password" 
              class="form-control"
              :disabled="authState.loading" 
              required
            />
            <button 
              type="button" 
              class="password-toggle" 
              @click="showPassword = !showPassword"
            >
              <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
            </button>
          </div>
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary btn-block" 
          :disabled="authState.loading"
        >
          <span v-if="authState.loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ authState.loading ? '登入中...' : '登入' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/api'

const router = useRouter()
const route = useRoute()

// 集中管理認證狀態
const authState = reactive({
  username: '',
  password: '',
  loading: false,
  error: null
})

// 密碼顯示控制
const showPassword = ref(false)

// 登入函數
const handleLogin = async () => {
  if (authState.loading) return;
  
  // 清除先前的錯誤提示
  authState.error = null;
  authState.loading = true;

  try {
    // 使用 API 模組進行登入
    const response = await api.auth.login(authState.username, authState.password);
    
    if (response.data === 'Login successful') {
      // 登入成功，導向首頁或指定的重定向頁面
      const redirectPath = route.query.redirect || '/admin';
      router.push(redirectPath);
    }
  } catch (error) {
    console.error('登入失敗:', error);
    
    // 處理錯誤顯示
    if (error.response) {
      // 服務器返回了錯誤狀態碼
      authState.error = error.response.data || '登入失敗，請檢查帳號和密碼';
    } else if (error.request) {
      // 請求已發送但沒有收到響應
      authState.error = '網路連線問題，請稍後再試';
    } else {
      // 發生其他錯誤
      authState.error = '登入過程中發生錯誤';
    }
  } finally {
    authState.loading = false;
  }
}

// 檢查登入狀態，如果已登入則重定向
const checkLoginStatus = async () => {
  try {
    const isLoggedIn = await api.auth.checkLoginStatus();
    if (isLoggedIn) {
      router.push('/admin');
    }
  } catch (error) {
    console.error('檢查登入狀態失敗:', error);
  }
}

// 組件掛載時檢查登入狀態
onMounted(() => {
  checkLoginStatus();
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
  font-weight: bold;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  margin-bottom: 0;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #4a7dde;
  box-shadow: 0 0 0 0.2rem rgba(74, 125, 222, 0.25);
  outline: none;
}

.password-field {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle:hover {
  color: #333;
}

.btn-block {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  background-color: #4a7dde;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-block:hover:not(:disabled) {
  background-color: #3a6ccd;
}

.btn-block:disabled {
  background-color: #91a9e0;
  cursor: not-allowed;
}

.alert {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 0;
}
</style>