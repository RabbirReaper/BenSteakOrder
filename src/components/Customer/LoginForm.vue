<template>
  <div class="login-container p-4">    
    <!-- 餐廳圖片 -->
    <div class="banner-container">
      <div class="store-banner">
        <img 
          :src="restaurantImage || '/placeholder-restaurant.jpg'" 
          alt="餐廳圖片" 
          class="banner-img"
        >
        <div class="banner-overlay"></div>
        <div class="banner-content">
          <h3 class="banner-title">犇野牛排 {{ storeName }}</h3>
        </div>
      </div>
    </div>
    
    <!-- 登入說明 -->
    <p class="text-center my-4 login-description">
      登入／註冊帳號，即可加入餐廳會員
    </p>
    
    <!-- 電話號碼輸入 -->
    <div class="phone-input mb-4">
      <label for="phoneNumber" class="form-label">手機號碼</label>
      <div class="input-group">
        <input 
          type="tel" 
          class="form-control" 
          id="phoneNumber" 
          v-model="phoneNumber"
          placeholder="請輸入手機號碼"
        >
      </div>
      <div class="form-text text-muted mt-2">
        請輸入您的手機號碼，我們將透過簡訊驗證您的身份
      </div>
    </div>
    
    <!-- 下一步按鈕 -->
    <div class="d-grid mt-4">
      <button 
        class="btn btn-primary btn-lg action-button"
        @click="checkPhoneNumber"
        :disabled="isLoading || !isValidPhoneNumber"
      >
        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
        <span>下一步</span>
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
const phoneNumber = ref('');
const isLoading = ref(false);

// 驗證電話號碼格式
const isValidPhoneNumber = computed(() => {
  if (!phoneNumber.value) return false;
  
  // 台灣手機號碼格式：09xxxxxxxx
  return /^09\d{8}$/.test(phoneNumber.value);
});

// 檢查電話號碼是否已註冊
const checkPhoneNumber = async () => {
  if (!isValidPhoneNumber.value) return;
  
  try {
    isLoading.value = true;
    
    // 保存電話號碼到 localStorage，以便在不同頁面中使用
    localStorage.setItem('phoneNumber', phoneNumber.value);
    localStorage.setItem('countryCode', '+886');
    
    // 保存店家 ID 到 localStorage
    if (storeId) {
      localStorage.setItem('store_Id', storeId);
    }
    
    // 使用 API 檢查電話號碼是否存在
    try {
      const response = await api.customer.checkPhoneExists(phoneNumber.value);
      
      if (response.data.success) {
        const isRegistered = response.data.exists;
        
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
      } else {
        // API返回成功但結果處理失敗
        alert('檢查電話號碼時出現錯誤，請稍後再試。');
      }
    } catch (error) {
      console.error('檢查電話號碼失敗:', error);
      if (error.response) {
        alert(error.response.data.message || '檢查電話號碼時出現錯誤，請稍後再試。');
      } else if (error.request) {
        alert('無法連線到伺服器，請檢查您的網路連接。');
      } else {
        alert('檢查電話號碼時出現錯誤，請稍後再試。');
      }
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
    
    if (response.data.success) {
      const storeData = response.data.store;
      storeName.value = storeData.name || '';
      
      // 設置餐廳圖片
      if (storeData.image && storeData.image.url) {
        restaurantImage.value = storeData.image.url;
      }
    } else {
      console.error('獲取店家信息失敗:', response.data.message);
    }
  } catch (error) {
    console.error('獲取店家信息失敗:', error);
  }
};

onMounted(() => {
  if (storeId) {
    fetchStoreInfo();
  }
});
</script>

<style scoped>
.login-container {
  max-width: 500px;
  margin: 0 auto;
  padding-top: 2rem;
  padding-bottom: 2rem;
  background-color: #fff;
  border-radius: 15px;
}

.banner-container {
  margin-bottom: 20px;
}

.store-banner {
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6));
}

.banner-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* 讓內容完全居中 */
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  width: 100%;
}


.banner-title {
  font-size: 2rem;
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.banner-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: 500;
  margin-bottom: 0;
}

.login-description {
  color: #666;
  font-size: 1.1rem;
}

.action-button {
  border-radius: 10px;
  padding: 0.75rem;
  font-weight: 500;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.action-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.input-group {
  border-radius: 10px;
  /* overflow: hidden; */
}

.input-group-text {
  background-color: #f8f9fa;
  font-weight: 500;
}
</style>