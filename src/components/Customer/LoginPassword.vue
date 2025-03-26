<template>
  <div class="login-password-container p-4">
    <div class="d-flex align-items-center mb-4">
      <button class="btn btn-link text-dark p-0 me-3" @click="goBack">
        <i class="bi bi-arrow-left fs-4"></i>
      </button>
      <h2 class="mb-0">登入</h2>
    </div>

    <p class="mb-4">請輸入密碼。</p>

    <!-- 顯示電話號碼 -->
    <div class="mb-4">
      <div class="d-flex align-items-center">
        <div class="phone-display py-2">
          {{ formattedPhone }}
        </div>
      </div>
    </div>

    <!-- 密碼輸入 -->
    <div class="mb-3">
      <label for="password" class="form-label">密碼</label>
      <div class="input-group">
        <input :type="showPassword ? 'text' : 'password'" class="form-control" id="password" v-model="password"
          placeholder="請輸入密碼">
        <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
          <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
        </button>
      </div>
    </div>

    <!-- 忘記密碼連結 -->
    <div class="mb-4 text-end">
      <router-link :to="{ name: 'customer-forgot-password', query: { phone: phoneNumber } }"
        class="text-decoration-none">
        忘記密碼？
      </router-link>
    </div>

    <!-- 登入按鈕 -->
    <div class="d-grid">
      <button class="btn btn-primary btn-lg" @click="login" :disabled="isLoading || !password">
        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
        登入
      </button>
    </div>
  </div>

  <!-- 登入失敗的 Modal -->
  <div class="modal fade" id="loginFailModal" tabindex="-1" ref="loginFailModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">登入失敗</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>{{ errorMessage || '密碼錯誤，請重新輸入。' }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">確定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/api';
import { Modal } from 'bootstrap';

const router = useRouter();
const route = useRoute();
const phoneNumber = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const loginFailModal = ref(null);
const errorMessage = ref('');

// 格式化電話號碼顯示
const formattedPhone = computed(() => {
  const countryCode = localStorage.getItem('countryCode') || '+886';
  const phone = phoneNumber.value;

  if (countryCode === '+886' && phone.startsWith('09')) {
    return `(${countryCode}) ${phone}`;
  }

  return `${countryCode} ${phone}`;
});

// 返回上一頁
const goBack = () => {
  router.go(-1);
};

// 登入
const login = async () => {
  if (!password.value) return;

  try {
    isLoading.value = true;
    errorMessage.value = '';

    try {
      const response = await api.customer.login(phoneNumber.value, password.value);

      if (response.data.success) {
        // 登入成功，儲存使用者狀態
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('customerName', response.data.name);

        // 獲取 storeId 並跳轉
        const storeId = route.query.store_id || localStorage.getItem('store_Id') || '1';

        // 跳轉回店家頁面
        router.push(`/customer/ordering/${storeId}`);
      } else {
        // 登入失敗 (API 回傳成功但驗證失敗的情況)
        errorMessage.value = response.data.message || '密碼錯誤，請重新輸入。';
        showLoginFailModal();
      }
    } catch (error) {
      console.error('登入失敗:', error);
      if (error.response) {
        errorMessage.value = error.response.data.message || '登入失敗，請稍後再試。';
      } else if (error.request) {
        errorMessage.value = '無法連線到伺服器，請檢查您的網路連接。';
      } else {
        errorMessage.value = '登入失敗，請稍後再試。';
      }
      showLoginFailModal();
    }
  } finally {
    isLoading.value = false;
  }
};
</script>