<template>
  <div class="container d-flex justify-content-center align-items-center vh-100">
    <div class="card p-4 shadow" style="max-width: 400px; width: 100%">
      <h2 class="text-center mb-4">管理員登入</h2>

      <form @submit.prevent="handleLogin" novalidate>
        <div class="mb-3">
          <label for="username" class="form-label">用戶名</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            class="form-control" 
            :class="{ 'is-invalid': usernameError }"
            required 
            @blur="validateUsername"
          />
          <div class="invalid-feedback">{{ usernameError }}</div>
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">密碼</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            class="form-control" 
            :class="{ 'is-invalid': passwordError }"
            required 
            @blur="validatePassword"
          />
          <div class="invalid-feedback">{{ passwordError }}</div>
        </div>

        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>

        <button 
          type="submit" 
          class="btn btn-primary w-100" 
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isSubmitting ? '登入中...' : '登入' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/api'

const username = ref('')
const password = ref('')
const errorMessage = ref('') // 儲存錯誤訊息
const isSubmitting = ref(false) // 提交狀態
const usernameError = ref('') // 用戶名錯誤訊息
const passwordError = ref('') // 密碼錯誤訊息
const router = useRouter()
const route = useRoute()

// 驗證用戶名
const validateUsername = () => {
  if (!username.value.trim()) {
    usernameError.value = '請輸入用戶名'
    return false
  }
  usernameError.value = ''
  return true
}

// 驗證密碼
const validatePassword = () => {
  if (!password.value) {
    passwordError.value = '請輸入密碼'
    return false
  }
  passwordError.value = ''
  return true
}

// 表單驗證
const validateForm = () => {
  const isUsernameValid = validateUsername()
  const isPasswordValid = validatePassword()
  return isUsernameValid && isPasswordValid
}

// 登入函數
const handleLogin = async () => {
  // 驗證表單
  if (!validateForm()) {
    return
  }

  errorMessage.value = '' // 先清空錯誤訊息
  isSubmitting.value = true // 設置提交狀態為 true

  try {
    const response = await api.auth.adminLogin(username.value, password.value)
    if (response.data.success) {
      const { role, storeId } = response.data
      const redirectPath = route.query.redirect

      if (redirectPath) {
        router.push(redirectPath)
      } else {
        router.push(role === 'super_admin' ? '/admin' : `/staff/${storeId}`)
      }
    }
  } catch (error) {
    if (error.response) {
      // 伺服器有回應但狀態碼不是 2xx
      errorMessage.value = error.response.data.message || '發生未知錯誤';
    } else if (error.request) {
      // 沒有收到伺服器的回應（可能是網路錯誤）
      errorMessage.value = '無法連線到伺服器';
    } else {
      // 其他錯誤（例如程式錯誤）
      errorMessage.value = '發生錯誤，請稍後再試';
    }
  } finally {
    isSubmitting.value = false // 無論成功或失敗，都將提交狀態設回 false
  }
}
</script>

<style scoped>
.container {
  height: 100vh;
}

.card {
  width: 100%;
  max-width: 400px;
}
</style>