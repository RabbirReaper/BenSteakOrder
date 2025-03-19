<template>
  <div class="login-container">
    <h2>登入系統</h2>
    
    <div class="role-toggle mb-4">
      <div class="btn-group w-100">
        <button 
          @click="loginType = 'admin'"
          :class="['btn', loginType === 'admin' ? 'btn-primary' : 'btn-outline-primary']"
        >
          管理員登入
        </button>
        <button 
          @click="loginType = 'customer'"
          :class="['btn', loginType === 'customer' ? 'btn-primary' : 'btn-outline-primary']"
        >
          會員登入
        </button>
      </div>
    </div>
    
    <form @submit.prevent="handleLogin">
      <!-- 管理員登入表單 -->
      <template v-if="loginType === 'admin'">
        <div class="form-group">
          <label for="username">用戶名:</label>
          <input type="text" id="username" v-model="username" required />
        </div>
        <div class="form-group">
          <label for="password">密碼:</label>
          <input type="password" id="password" v-model="password" required />
        </div>
      </template>
      
      <!-- 客戶登入表單 -->
      <template v-else>
        <div class="form-group">
          <label for="phoneNumber">電話號碼:</label>
          <input type="text" id="phoneNumber" v-model="phoneNumber" required />
        </div>
        <div class="form-group">
          <label for="customerPassword">密碼:</label>
          <input type="password" id="customerPassword" v-model="customerPassword" required />
        </div>
        <div class="text-end">
          <a href="#" @click.prevent="showRegisterModal = true">註冊新帳號</a>
        </div>
      </template>
      
      <button type="submit">登入</button>
    </form>
    
    <!-- 註冊彈窗 -->
    <div v-if="showRegisterModal" class="modal-overlay">
      <div class="modal-content">
        <h3>註冊新帳號</h3>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="registerName">姓名:</label>
            <input type="text" id="registerName" v-model="registerForm.name" required />
          </div>
          <div class="form-group">
            <label for="registerPhone">電話號碼:</label>
            <input type="text" id="registerPhone" v-model="registerForm.phoneNumber" required />
          </div>
          <div class="form-group">
            <label for="registerPassword">密碼 (可選):</label>
            <input type="password" id="registerPassword" v-model="registerForm.password" />
            <small>若不填寫，將使用電話號碼作為預設密碼</small>
          </div>
          <div class="button-group">
            <button type="button" @click="showRegisterModal = false">取消</button>
            <button type="submit">註冊</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/api'

const loginType = ref('admin') // 'admin' 或 'customer'
const username = ref('')
const password = ref('')
const phoneNumber = ref('')
const customerPassword = ref('')
const router = useRouter()
const route = useRoute()

// 註冊相關
const showRegisterModal = ref(false)
const registerForm = ref({
  name: '',
  phoneNumber: '',
  password: ''
})

// 登入函數
const handleLogin = async () => {
  try {
    let response;
    
    if (loginType.value === 'admin') {
      // 管理員登入
      response = await api.auth.adminLogin(username.value, password.value);
      
      if (response.data.success) {
        // 根據角色導向不同頁面
        if (response.data.role === 'super_admin') {
          router.push('/admin')
        } else {
          router.push(`/admin/store/${response.data.storeId}`)
        }
      }
    } else {
      // 客戶登入
      response = await api.auth.customerLogin(phoneNumber.value, customerPassword.value);
      
      if (response.data.success) {
        router.push('/customer/profile')
      }
    }
  } catch (error) {
    console.error('登入失敗:', error.response ? error.response.data : error)
    alert('登入失敗: ' + (error.response ? error.response.data : error.message))
  }
}

// 註冊函數
const handleRegister = async () => {
  try {
    await api.auth.customerRegister(
      registerForm.value.name,
      registerForm.value.phoneNumber,
      registerForm.value.password
    );
    
    alert('註冊成功！請使用您的帳號登入')
    showRegisterModal.value = false
    
    // 自動填入電話號碼，方便登入
    phoneNumber.value = registerForm.value.phoneNumber
    customerPassword.value = registerForm.value.password || registerForm.value.phoneNumber
    
    // 重置註冊表單
    registerForm.value = {
      name: '',
      phoneNumber: '',
      password: ''
    }
  } catch (error) {
    console.error('註冊失敗:', error.response ? error.response.data : error)
    alert('註冊失敗: ' + (error.response ? error.response.data : error.message))
  }
}

// 共用登出函數（也可放在全局，方便其他元件調用）
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 80%;
  max-width: 500px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.role-toggle {
  margin-bottom: 20px;
}
</style>