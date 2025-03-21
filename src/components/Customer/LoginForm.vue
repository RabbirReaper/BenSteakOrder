<template>
  <div class="login-container p-4">
    <!-- 頁面標題 -->
    <h2 class="text-center mb-4">會員登入/註冊</h2>
    
    <!-- 餐廳圖片 -->
    <div class="restaurant-image mb-4 text-center">
      <img 
        :src="restaurantImage || '/placeholder-restaurant.jpg'" 
        alt="餐廳圖片" 
        class="img-fluid rounded"
        style="max-height: 200px; object-fit: cover;"
      >
      <h3 class="mt-3">犇野牛排 {{ storeName }}</h3>
    </div>
    
    <!-- 登入說明 -->
    <p class="text-center mb-4">
      登入／註冊帳號，即可加入餐廳會員。
    </p>
    
    <!-- 電話號碼輸入 -->
    <div class="phone-input mb-4">
      <label for="phoneNumber" class="form-label">手機號碼</label>
      <div class="input-group mb-3">
        <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
          {{ selectedCountryCode }}
        </button>
        <ul class="dropdown-menu">
          <li v-for="code in countryCodes" :key="code">
            <a class="dropdown-item" href="#" @click.prevent="selectedCountryCode = code">{{ code }}</a>
          </li>
        </ul>
        <input 
          type="tel" 
          class="form-control" 
          id="phoneNumber" 
          v-model="phoneNumber"
          placeholder="請輸入手機號碼"
        >
      </div>
      <div class="form-text text-muted">
        請輸入您的手機號碼，我們將透過簡訊驗證您的身份。
      </div>
    </div>
    
    <!-- 下一步按鈕 -->
    <div class="d-grid">
      <button 
        class="btn btn-primary btn-lg" 
        @click="checkPhoneNumber"
        :disabled="isLoading || !isValidPhoneNumber"
      >
        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
        下一步
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/api';

const router = useRouter();
const route = useRoute();

// 取得店家ID
const storeId = route.query.store_id;
const storeName = ref('');
const restaurantImage = ref('');

// 電話號碼相關
const countryCodes = ['+886', '+86', '+1', '+81', '+852'];
const selectedCountryCode = ref('+886');
const phoneNumber = ref('');
const isLoading = ref(false);

// 驗證電話號碼格式
const isValidPhoneNumber = computed(() => {
  if (!phoneNumber.value) return false;
  
  // 簡單的電話號碼驗證
  if (selectedCountryCode.value === '+886') {
    // 台灣手機號碼格式：09xxxxxxxx
    return /^09\d{8}$/.test(phoneNumber.value);
  }
  
  // 其他國家的號碼，至少要有6位數
  return phoneNumber.value.length >= 6;
});

// 檢查電話號碼是否已註冊
const checkPhoneNumber = async () => {
  if (!isValidPhoneNumber.value) return;
  
  try {
    isLoading.value = true;
    
    // 保存電話號碼到 localStorage，以便在不同頁面中使用
    localStorage.setItem('phoneNumber', phoneNumber.value);
    localStorage.setItem('countryCode', selectedCountryCode.value);
    
    // 保存店家 ID 到 localStorage
    if (storeId) {
      localStorage.setItem('storeId', storeId);
    }
    
    // 檢查是否已註冊
    try {
      // 這裡應該調用 API 檢查電話號碼是否存在
      // 目前先模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 假設我們有一個 api.auth.checkPhoneExists 方法
      // const response = await api.auth.checkPhoneExists(phoneNumber.value);
      
      // 假設已註冊的電話號碼
      const registeredPhones = ['0912345678', '0987654321'];
      const isRegistered = registeredPhones.includes(phoneNumber.value);
      
      if (isRegistered) {
        // 已註冊，跳轉到密碼輸入頁面
        router.push({
          name: 'customer-login-password',
          query: { 
            phone: phoneNumber.value,
            store_id: storeId
          }
        });
      } else {
        // 未註冊，跳轉到註冊頁面
        router.push({
          name: 'customer-register',
          query: { 
            phone: phoneNumber.value,
            store_id: storeId 
          }
        });
      }
    } catch (error) {
      console.error('檢查電話號碼失敗:', error);
      alert('檢查電話號碼時出現錯誤，請稍後再試。');
    }
  } finally {
    isLoading.value = false;
  }
};

// 獲取餐廳信息
const fetchStoreInfo = async () => {
  try {
    // 從 API 獲取店家信息
    const response = await api.store.getById(storeId);
    storeName.value = response.data.name || '';
    
    // 設置餐廳圖片
    if (response.data.image && response.data.image.url) {
      restaurantImage.value = response.data.image.url;
    }
  } catch (error) {
    console.error('獲取店家信息失敗:', error);
  }
};

onMounted(() => {
  fetchStoreInfo();
});
</script>

<style scoped>
.login-container {
  max-width: 500px;
  margin: 0 auto;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.restaurant-image {
  position: relative;
}

.restaurant-image h3 {
  margin-top: 0.5rem;
  font-weight: bold;
  color: #333;
}
</style>