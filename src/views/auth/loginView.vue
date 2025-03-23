<template>
  <div class="login-container">
    <h2>管理員登入系統</h2>
    
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">用戶名:</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div class="form-group">
        <label for="password">密碼:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      
      <button type="submit">登入</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/api'

const username = ref('')
const password = ref('')
const router = useRouter()
const route = useRoute()

// 登入函數
const handleLogin = async () => {
  try {
    // 管理員登入
    const response = await api.auth.adminLogin(username.value, password.value);
    
    if (response.data.success) {
      // 根據角色導向不同頁面
      if (response.data.role === 'super_admin') {
        router.push('/admin')
      } else {
        router.push(`/admin/store/${response.data.storeId}`)
      }
    }
  } catch (error) {
    console.error('登入失敗:', error.response ? error.response.data : error)
    alert('登入失敗: ' + (error.response ? error.response.data : error.message))
  }
}

// 登出函數
const handleLogout = async () => {
  try {
    await api.auth.logout();
  } catch (error) {
    console.error('登出錯誤:', error.response ? error.response.data : error)
  } finally {
    localStorage.removeItem('authToken')
    localStorage.removeItem('loginTime')
    router.push('/login')
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>