<template>
  <div class="coupons-container p-3">
    <!-- 頂部導航 -->
    <div class="top-nav d-flex align-items-center py-3">
      <button class="btn btn-link text-dark p-0" @click="goBack">
        <i class="bi bi-arrow-left fs-4"></i>
      </button>
      <h5 class="mb-0 mx-auto">我的優惠券</h5>
    </div>

    <!-- 優惠券列表 -->
    <div class="coupons-section">
      <!-- Tab 切換 -->
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="{ active: activeTab === 'available' }"
            @click="activeTab = 'available'"
          >
            可使用 ({{ availableCoupons.length }})
          </button>
        </li>
        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="{ active: activeTab === 'used' }"
            @click="activeTab = 'used'"
          >
            已使用
          </button>
        </li>
        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="{ active: activeTab === 'expired' }"
            @click="activeTab = 'expired'"
          >
            已過期
          </button>
        </li>
      </ul>

      <!-- 載入中 -->
      <div v-if="isLoading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">載入中...</p>
      </div>

      <!-- 無優惠券時顯示 -->
      <div v-else-if="filteredCoupons.length === 0" class="text-center py-4">
        <div class="empty-state">
          <i class="bi bi-ticket-perforated fs-1 text-muted"></i>
          <p class="mt-2 text-muted">
            {{ 
              activeTab === 'available' ? '沒有可使用的優惠券' : 
              activeTab === 'used' ? '沒有已使用的優惠券' : 
              '沒有已過期的優惠券' 
            }}
          </p>
        </div>
      </div>

      <!-- 優惠券列表 -->
      <div v-else class="coupon-list">
        <div v-for="(coupon, index) in filteredCoupons" :key="index" 
             class="coupon-card mb-3"
             :class="{ 'used': coupon.status === 'used', 'expired': coupon.status === 'expired' }">
          <div class="coupon-content">
            <div class="coupon-left">
              <div class="coupon-value">
                <span class="discount-symbol">$</span>
                <span class="discount-amount">{{ coupon.discount }}</span>
              </div>
              <div class="coupon-detail mt-2">
                <small>滿 ${{ coupon.minSpend }} 可使用</small>
              </div>
            </div>
            <div class="coupon-divider"></div>
            <div class="coupon-info">
              <h6 class="coupon-title">{{ coupon.name }}</h6>
              <p class="coupon-description mb-1">{{ coupon.description }}</p>
              <p class="coupon-validity mb-2">
                有效期限: {{ formatDate(coupon.expiryDate) }}
              </p>
              <div v-if="coupon.status === 'available'" class="coupon-action">
                <button class="btn btn-sm btn-outline-primary" @click="useCoupon(coupon)">
                  立即使用
                </button>
              </div>
              <div v-else-if="coupon.status === 'used'" class="coupon-status">
                <span class="badge bg-secondary">已使用</span>
              </div>
              <div v-else-if="coupon.status === 'expired'" class="coupon-status">
                <span class="badge bg-danger">已過期</span>
              </div>
            </div>
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
const isLoading = ref(true);
const activeTab = ref('available');
const coupons = ref([]);

// 返回上一頁
const goBack = () => {
  router.push('/customer/my-account');
};

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 使用優惠券
const useCoupon = (coupon) => {
  // 跳轉到點餐頁面，並傳遞優惠券 ID
  router.push({
    path: `/customer/ordering/1`, // 假設店家 ID 為 1
    query: { couponId: coupon.id }
  });
};

// 過濾可用優惠券
const availableCoupons = computed(() => {
  return coupons.value.filter(coupon => coupon.status === 'available');
});

// 根據當前標籤過濾優惠券
const filteredCoupons = computed(() => {
  return coupons.value.filter(coupon => coupon.status === activeTab.value);
});

// 獲取優惠券資訊
const fetchCoupons = async () => {
  try {
    isLoading.value = true;
    
    // 這裡應該調用實際的 API 來獲取優惠券資訊
    // 模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 模擬數據
    coupons.value = [
      {
        id: 1,
        name: '新會員折價券',
        description: '新會員專屬優惠',
        discount: 50,
        minSpend: 100,
        expiryDate: '2023-12-31',
        status: 'available'
      },
      {
        id: 2,
        name: '生日優惠券',
        description: '生日當月專屬優惠',
        discount: 100,
        minSpend: 200,
        expiryDate: '2023-11-30',
        status: 'available'
      },
      {
        id: 3,
        name: '滿額折扣券',
        description: '單筆消費滿500元可使用',
        discount: 80,
        minSpend: 500,
        expiryDate: '2023-10-15',
        status: 'used',
        usedDate: '2023-10-10'
      },
      {
        id: 4,
        name: '開幕慶優惠券',
        description: '開幕限定優惠',
        discount: 150,
        minSpend: 300,
        expiryDate: '2023-09-30',
        status: 'expired'
      }
    ];
    
  } catch (error) {
    console.error('獲取優惠券資訊失敗:', error);
    alert('獲取優惠券資訊失敗，請稍後再試。');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchCoupons();
});
</script>

<style scoped>
.coupons-container {
  padding-bottom: 2rem;
}

.top-nav {
  position: relative;
}

.nav-tabs .nav-link {
  color: #6c757d;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 2px solid transparent;
  padding: 0.5rem 1rem;
  margin-right: 1rem;
}

.nav-tabs .nav-link.active {
  color: #4a7dde;
  border-bottom-color: #4a7dde;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
}

.coupon-card {
  border-radius: 10px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.coupon-card.used::before,
.coupon-card.expired::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 1;
}

.coupon-content {
  display: flex;
  min-height: 120px;
}

.coupon-left {
  background: linear-gradient(135deg, #4a7dde, #7d6ade);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  width: 120px;
  position: relative;
}

.coupon-divider {
  position: relative;
  width: 15px;
  background-color: white;
}

.coupon-divider::before,
.coupon-divider::after {
  content: '';
  position: absolute;
  width: 15px;
  height: 15px;
  background-color: #f8f9fa;
  border-radius: 50%;
  left: 0;
  transform: translateX(-50%);
}

.coupon-divider::before {
  top: -7.5px;
}

.coupon-divider::after {
  bottom: -7.5px;
}

.coupon-info {
  flex: 1;
  padding: 1rem;
  position: relative;
  z-index: 2;
}

.coupon-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.coupon-description {
  font-size: 0.9rem;
  color: #6c757d;
}

.coupon-validity {
  font-size: 0.8rem;
  color: #6c757d;
}

.discount-symbol {
  font-size: 1.2rem;
  vertical-align: top;
}

.discount-amount {
  font-size: 2rem;
  font-weight: bold;
}

.coupon-detail {
  font-size: 0.8rem;
}

.coupon-action,
.coupon-status {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}
</style>