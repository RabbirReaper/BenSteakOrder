<template>
  <div class="container d-flex justify-content-center align-items-center vh-100">
    <div class="card p-4 shadow" style="max-width: 400px; width: 100%">
      <h2 class="text-center mb-4">管理員登入</h2>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="username" class="form-label">用戶名</label>
          <input type="text" id="username" v-model="username" class="form-control" required />
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">密碼</label>
          <input type="password" id="password" v-model="password" class="form-control" required />
        </div>

        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn btn-primary w-100">登入</button>
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
const router = useRouter()
const route = useRoute()

// 登入函數
const handleLogin = async () => {
  errorMessage.value = '' // 先清空錯誤訊息
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