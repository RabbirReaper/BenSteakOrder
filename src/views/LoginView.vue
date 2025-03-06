<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

const username = ref('')
const password = ref('')
const router = useRouter()
const route = useRoute()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


// 登入函數
const handleLogin = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/authentication/login`, {
      name: username.value,
      password: password.value
    })

    if (response.data === 'Login successful') {

      // 讀取 query 中的 redirect 參數，若無則預設跳轉到 /admin
      const redirectPath = route.query.redirect || '/admin'
      router.push(redirectPath)
    }
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error)
    alert('Login failed: ' + (error.response ? error.response.data : error.message))
  }
}

// 共用登出函數（也可放在全局，方便其他元件調用）
const handleLogout = async () => {
  try {
    await axios.post(`${API_BASE_URL}/authentication/logout`)
  } catch (error) {
    console.error('Logout error:', error.response ? error.response.data : error)
  } finally {
    localStorage.removeItem('authToken')
    localStorage.removeItem('loginTime')
    clearAutoLogout()
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
