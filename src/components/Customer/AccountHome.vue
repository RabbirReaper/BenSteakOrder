<template>
  <div class="account-home-container p-3">
    <!-- 頂部導航 -->
    <div class="top-nav d-flex align-items-center py-3">
      <button class="btn btn-link text-dark p-0" @click="goBack">
        <i class="bi bi-arrow-left fs-4"></i>
      </button>
      <h5 class="mb-0 mx-auto">會員專區</h5>
    </div>

    <!-- 會員信息卡片 -->
    <div class="user-info-card bg-primary text-white p-4 rounded-3 mb-4">
      <div class="d-flex align-items-center">
        <div class="user-avatar me-3">
          <div class="avatar-circle">
            {{ userInitial }}
          </div>
        </div>
        <div class="user-details">
          <h5 class="mb-1">{{ customer.name }}</h5>
          <p class="mb-0">{{ formattedPhone }}</p>
        </div>
      </div>
    </div>

    <!-- 會員功能選單 -->
    <div class="menu-list">
      <router-link to="/customer/my-account/edit" class="menu-item">
        <div class="d-flex align-items-center justify-content-between p-3 border-bottom">
          <div class="d-flex align-items-center">
            <i class="bi bi-person-circle me-3 fs-5"></i>
            <span>個人資料</span>
          </div>
          <i class="bi bi-chevron-right"></i>
        </div>
      </router-link>

      <router-link to="/customer/my-account/points" class="menu-item">
        <div class="d-flex align-items-center justify-content-between p-3 border-bottom">
          <div class="d-flex align-items-center">
            <i class="bi bi-star-fill me-3 fs-5"></i>
            <span>我的點數</span>
          </div>
          <div class="d-flex align-items-center">
            <i class="bi bi-chevron-right"></i>
          </div>
        </div>
      </router-link>

      <router-link to="/customer/my-account/orders" class="menu-item">
        <div class="d-flex align-items-center justify-content-between p-3 border-bottom">
          <div class="d-flex align-items-center">
            <i class="bi bi-receipt me-3 fs-5"></i>
            <span>我的訂單</span>
          </div>
          <i class="bi bi-chevron-right"></i>
        </div>
      </router-link>

      <router-link to="/customer/my-account/password/edit" class="menu-item">
        <div class="d-flex align-items-center justify-content-between p-3 border-bottom">
          <div class="d-flex align-items-center">
            <i class="bi bi-lock-fill me-3 fs-5"></i>
            <span>修改密碼</span>
          </div>
          <i class="bi bi-chevron-right"></i>
        </div>
      </router-link>

      <div class="menu-item" @click="logout">
        <div class="d-flex align-items-center justify-content-between p-3 border-bottom">
          <div class="d-flex align-items-center">
            <i class="bi bi-box-arrow-right me-3 fs-5 text-danger"></i>
            <span class="text-danger">登出</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';

const router = useRouter();
const customer = ref({
  name: '',
  phoneNumber: '',
  points: 0,
  coupons: []
});
const storeId = localStorage.getItem('store_Id') || '1';
const errorMessage = ref('');

// 獲取用戶名首字母作為頭像
const userInitial = computed(() => {
  if (!customer.value.name) return '?';
  return customer.value.name.charAt(0).toUpperCase();
});

// 格式化電話號碼
const formattedPhone = computed(() => {
  const countryCode = localStorage.getItem('countryCode') || '+886';
  const phone = customer.value.phoneNumber;

  if (!phone) return '';

  if (countryCode === '+886' && phone.startsWith('09')) {
    return `(${countryCode}) ${phone}`;
  }

  return `${countryCode} ${phone}`;
});

// 返回上一頁
const goBack = () => {
  // 從 localStorage 獲取 storeId，如果沒有則使用默認值 '1'
  router.push(`/customer/ordering/${storeId}`);
};

// 登出
const logout = async () => {
  try {
    // 調用登出 API
    const response = await api.auth.logout();
    
    if (response.data.success) {
      // 清除本地存儲
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('customerName');
      
      // 跳轉到點餐頁面
      router.push(`/customer/ordering/${storeId}`);
    } else {
      errorMessage.value = response.data.message || '登出失敗，請稍後再試。';
      alert(errorMessage.value);
    }
  } catch (error) {
    console.error('登出失敗:', error);
    if (error.response) {
      errorMessage.value = error.response.data.message || '登出失敗，請稍後再試。';
    } else if (error.request) {
      errorMessage.value = '無法連線到伺服器，請檢查您的網路連接。';
    } else {
      errorMessage.value = '登出失敗，請稍後再試。';
    }
    alert(errorMessage.value);
  }
};

// 獲取會員資料
const fetchCustomerData = async () => {
  try {
    // 嘗試使用 API 獲取會員資料
    try {
      const response = await api.customer.getProfile();
      
      if (response.data.success) {
        // 如果成功獲取到資料，使用 API 返回的資料
        customer.value = response.data.profile;
      } else {
        console.warn('API 獲取會員資料失敗:', response.data.message);
        // 回退使用本地存儲的資料
        customer.value = {
          name: localStorage.getItem('customerName') || '',
          phoneNumber: localStorage.getItem('phoneNumber') || '',
        };
      }
    } catch (apiError) {
      console.warn('API 獲取會員資料失敗，使用本地資料:', apiError);
      // 如果 API 請求失敗，回退使用本地存儲的資料
      customer.value = {
        name: localStorage.getItem('customerName') || '',
        phoneNumber: localStorage.getItem('phoneNumber') || '',
      };
    }
  } catch (error) {
    console.error('獲取會員資料失敗:', error);
    alert('獲取會員資料失敗，請稍後再試。');
  }
};

onMounted(() => {
  fetchCustomerData();
});
</script>

<style scoped>
.account-home-container {
  padding-bottom: 2rem;
}

.top-nav {
  position: relative;
}

.user-info-card {
  background: linear-gradient(135deg, #4a7dde, #7d6ade);
  border-radius: 15px;
}

.avatar-circle {
  width: 60px;
  height: 60px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.menu-item {
  text-decoration: none;
  color: inherit;
  display: block;
}

.menu-item:hover {
  background-color: #f8f9fa;
}
</style>