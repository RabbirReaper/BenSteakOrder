<template>
  <div class="main-container">
    <div class="center-container" v-if="orderItem">
      <div class="p-4">
        <h1 class="mb-4 fw-bold">訂單細節</h1>

        <!-- 訂單基本信息 -->
        <div class="bg-light p-4 rounded mb-4">
          <div class="row g-3">
            <div class="col-md-6"><span class="fw-bold">訂單編號:</span> {{ orderItem.orderNumber }}</div>
            <div class="col-md-6"><span class="fw-bold">取餐方式:</span> {{ orderItem.pickupMethod }}</div>
            <div class="col-md-6" v-if="orderItem.pickupMethod === '內用'">
              <span class="fw-bold">桌號:</span> {{ orderItem.tableNumber }}
            </div>
            <div class="col-md-6"><span class="fw-bold">付款方式:</span> {{ getPaymentMethodText(orderItem.paymentMethod) }}</div>
            <div class="col-md-6"><span class="fw-bold">訂單日期:</span> {{ formatDate(orderItem.createdAt) }}</div>
            <div class="col-md-6"><span class="fw-bold">訂單狀態:</span> {{ getOrderStatusText(orderItem.orderStatus) }}
            </div>
          </div>
          <div v-if="orderItem.remarks" class="mt-2">
            <span class="fw-bold">訂單備註:</span> {{ orderItem.remarks }}
          </div>
          <div v-if="orderItem.store && orderItem.store.name" class="mt-2">
            <span class="fw-bold">分店:</span> {{ orderItem.store.name }}
          </div>
        </div>

        <!-- 訂單項目 -->
        <h2 class="mb-3 fw-bold">訂單明細</h2>
        <div class="card mb-4">
          <div class="list-group list-group-flush">
            <div v-for="(item, index) in orderItem.items" :key="index" class="list-group-item">
              <h4 class="mb-2 fw-bold" v-if="item.itemId && item.itemId.name">{{ item.itemId.name }}</h4>
              <h4 class="mb-2 fw-bold text-muted" v-else>未知商品</h4>

              <!-- 主餐顯示所有選項 -->
              <div v-if="item.itemModel === 'MainDish'" class="ms-4">
                <div v-if="item.options && item.options.doneness" class="mb-1">
                  <span class="fw-medium">熟度:</span> {{ item.options.doneness }}
                </div>
                <div v-if="item.options && item.options.sauce" class="mb-1">
                  <span class="fw-medium">醬料:</span> {{ item.options.sauce }}
                </div>
                <div v-if="item.options && item.options.addons && item.options.addons.length > 0" class="mb-1">
                  <span class="fw-medium">加點:</span> {{ getAddonNames(item.options.addons) }}
                </div>
                <div v-if="item.options && item.options.additionalMeats && item.options.additionalMeats.length > 0" class="mb-1">
                  <span class="fw-medium">加點肉品:</span> {{ getMeatNames(item.options.additionalMeats) }}
                </div>
                <div v-if="item.options && item.options.extraOptions && item.options.extraOptions.length > 0" class="mb-1">
                  <span class="fw-medium">額外需求:</span> {{ item.options.extraOptions.join(', ') }}
                </div>
                <div v-if="item.options && item.options.remarks" class="mb-1">
                  <span class="fw-medium">特殊要求:</span> {{ item.options.remarks }}
                </div>
              </div>

              <!-- 共同顯示的信息 -->
              <div class="row mt-2">
                <div class="col-6"><span class="fw-medium">數量:</span> {{ item.amount }}</div>
                <div class="col-6"><span class="fw-medium">金額:</span> {{ item.thisMoney.toLocaleString('en-US') }} 元</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 訂單金額統計 -->
        <div class="card">
          <div class="card-body bg-light">
            <div class="d-flex justify-content-between mb-2">
              <span>餐點金額</span>
              <span>{{ orderItem.orderAmount.toLocaleString('en-US') }} 元</span>
            </div>
            <div v-if="orderItem.discounts > 0" class="d-flex justify-content-between mb-2">
              <span>折扣</span>
              <span>-{{ orderItem.discounts }} 元</span>
            </div>
            <div v-if="orderItem.pointsDiscount > 0" class="d-flex justify-content-between mb-2">
              <span>優惠券折抵</span>
              <span>-{{ orderItem.pointsDiscount }} 元</span>
            </div>
            <div v-if="orderItem.deliveryFee > 0" class="d-flex justify-content-between mb-2">
              <span>外送費</span>
              <span>{{ orderItem.deliveryFee }} 元</span>
            </div>
            <div class="d-flex justify-content-between fw-bold fs-5 border-top pt-2 mt-2">
              <span>總計</span>
              <span>{{ orderItem.totalMoney.toLocaleString('en-US') }} 元</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="isLoading" class="center-container p-4 d-flex flex-column align-items-center justify-content-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">載入訂單資料中...</p>
    </div>
    <div v-else class="center-container p-4 d-flex flex-column align-items-center justify-content-center">
      <div class="alert alert-danger" role="alert">
        {{ errorMessage || '載入訂單失敗，請稍後再試。' }}
      </div>
      <button class="btn btn-primary mt-3" @click="getOrder">重新載入</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';

const route = useRoute();
const router = useRouter();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const orderId = route.params.orderId;
const orderItem = ref(null);
const isLoading = ref(true);
const errorMessage = ref('');

const getOrder = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  orderItem.value = null;
  
  try {
    const response = await api.order.getById(orderId);
    if (response.data.success) {
      orderItem.value = response.data.order;
    } else {
      errorMessage.value = response.data.message || '找不到訂單資料';
    }
  } catch (error) {
    console.error('Error fetching order:', error);
    if (error.response) {
      // 伺服器回應非 2xx 狀態碼
      errorMessage.value = error.response.data.message || `訂單載入失敗 (${error.response.status})`;
    } else if (error.request) {
      // 未收到服務器回應
      errorMessage.value = '無法連線到伺服器，請檢查網路連線';
    } else {
      // 請求設置錯誤
      errorMessage.value = '系統錯誤，請稍後再試';
    }
  } finally {
    isLoading.value = false;
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 取得訂單狀態中文說明
const getOrderStatusText = (status) => {
  const statusMap = {
    'Unpaid': '未付款',
    'Completed': '已完成',
    'Canceled': '已取消'
  };
  return statusMap[status] || status;
};

// 取得付款方式中文說明
const getPaymentMethodText = (method) => {
  const methodMap = {
    '現金': '現金支付',
    'linepay': 'LINE Pay',
    'FoodPanda': 'FoodPanda',
    'UberEat': 'Uber Eats'
  };
  return methodMap[method] || method;
};

// 從加點數組獲取名稱
const getAddonNames = (addons) => {
  if (!addons || !addons.length) return '';

  return addons.map(addon => {
    if (typeof addon === 'object' && addon !== null) {
      return addon.name || '未知加點';
    }
    return '未知加點';
  }).join(', ');
};

// 從肉品數組獲取名稱
const getMeatNames = (meats) => {
  if (!meats || !meats.length) return '';

  return meats.map(meat => {
    if (typeof meat === 'object' && meat !== null) {
      return meat.name || '未知肉品';
    }
    return '未知肉品';
  }).join(', ');
};

onMounted(async () => {
  await getOrder();
});
</script>

<style>
.main-container {
  min-height: 100vh;
  background-color: #eaeae668;
}

.center-container {
  max-width: 768px;
  margin: 0 auto;
  position: relative;
  background-color: #ffffff;
  min-height: 100vh;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}
</style>