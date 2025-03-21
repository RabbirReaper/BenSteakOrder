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
        <input 
          :type="showPassword ? 'text' : 'password'" 
          class="form-control"
          id="password"
          v-model="password"
          placeholder="請輸入密碼"
        >
        <button 
          class="btn btn-outline-secondary" 
          type="button"
          @click="showPassword = !showPassword"
        >
          <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
        </button>
      </div>
    </div>
    
    <!-- 忘記密碼連結 -->
    <div class="mb-4 text-end">
      <router-link :to="{ name: 'customer-forgot-password', query: { phone: phoneNumber } }" class="text-decoration-none">
        忘記密碼？
      </router-link>
    </div>
    
    <!-- 登入按鈕 -->
    <div class="d-grid">
      <button 
        class="btn btn-primary btn-lg" 
        @click="login"
        :disabled="isLoading || !password"
      >
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
          <p>密碼錯誤，請重新輸入。</p>
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
    
    // 這裡應該調用實際的登入 API
    // 模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // 假設我們有一個 api.auth.customerLogin 方法
      // const response = await api.auth.customerLogin(phoneNumber.value, password.value);
      
      // 模擬登入檢查
      if (password.value === '123456') {
        // 登入成功
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('customerName', '測試用戶');
        
        // 獲取 storeId 並跳轉
        // 1. 先嘗試從 URL query 獲取
        // 2. 再嘗試從 localStorage 獲取
        // 3. 最後使用默認值 '1'
        const storeId = route.query.store_id || localStorage.getItem('storeId') || '1';
        
        // 跳轉回店家頁面
        router.push(`/customer/ordering/${storeId}`);
      } else {
        // 登入失敗
        showLoginFailModal();
      }
    } catch (error) {
      console.error('登入失敗:', error);
      showLoginFailModal();
    }
    
  } finally {
    isLoading.value = false;
  }
};

// 顯示登入失敗的 Modal
const showLoginFailModal = () => {
  if (loginFailModal.value) {
    const modal = new Modal(loginFailModal.value);
    modal.show();
  }
};

onMounted(() => {
  // 從 URL 獲取電話號碼
  phoneNumber.value = route.query.phone || localStorage.getItem('phoneNumber') || '';
  
  // 初始化 Modal
  loginFailModal.value = document.getElementById('loginFailModal');
});
</script>

<style scoped>
.login-password-container {
  max-width: 500px;
  margin: 0 auto;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.phone-display {
  font-size: 1.1rem;
  font-weight: 500;
}
</style>