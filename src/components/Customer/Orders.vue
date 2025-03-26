<template>
  <div class="orders-container p-3">
    <!-- 頂部導航 -->
    <div class="top-nav d-flex align-items-center py-3">
      <button class="btn btn-link text-dark p-0" @click="goBack">
        <i class="bi bi-arrow-left fs-4"></i>
      </button>
      <h5 class="mb-0 mx-auto">我的訂單</h5>
    </div>

    <!-- 訂單列表 -->
    <div class="orders-section">
      <!-- Tab 切換 -->
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="{ active: activeTab === 'all' }"
            @click="activeTab = 'all'"
          >
            全部
          </button>
        </li>
        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="{ active: activeTab === 'unpaid' }"
            @click="activeTab = 'unpaid'"
          >
            未完成
          </button>
        </li>
        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="{ active: activeTab === 'completed' }"
            @click="activeTab = 'completed'"
          >
            已完成
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

      <!-- 無訂單時顯示 -->
      <div v-else-if="filteredOrders.length === 0" class="text-center py-4">
        <div class="empty-state">
          <i class="bi bi-receipt fs-1 text-muted"></i>
          <p class="mt-2 text-muted">沒有找到訂單</p>
        </div>
      </div>

      <!-- 訂單列表 -->
      <div v-else class="order-list">
        <div v-for="(order, index) in filteredOrders" :key="index" 
             class="order-card mb-3"
             @click="viewOrderDetail(order)">
          <div class="card">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <span class="me-2">訂單號：{{ order.orderNumber }}</span>
                <span class="badge" :class="getStatusBadgeClass(order.orderStatus)">
                  {{ getStatusText(order.orderStatus) }}
                </span>
              </div>
              <span class="text-muted small">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between mb-2">
                <span>{{ getRestaurantName(order) }}</span>
                <span class="badge bg-light text-dark">{{ order.pickupMethod }}</span>
              </div>
              
              <div class="order-items">
                <div v-for="(item, itemIndex) in getDisplayItems(order.items)" :key="itemIndex" class="mb-1">
                  <div class="d-flex justify-content-between">
                    <span>{{ item.name }} × {{ item.amount }}</span>
                    <span>${{ item.price }}</span>
                  </div>
                </div>
                
                <div v-if="order.items.length > 3" class="text-muted small">
                  還有 {{ order.items.length - 3 }} 項...
                </div>
              </div>
              
              <div class="divider my-2"></div>
              
              <div class="d-flex justify-content-between">
                <span>共 {{ getTotalItems(order.items) }} 件商品</span>
                <span class="fw-bold">合計：${{ order.totalMoney }}</span>
              </div>
            </div>
            <div class="card-footer bg-white text-end">
              <button class="btn btn-outline-primary btn-sm" @click.stop="viewOrderDetail(order)">
                查看詳情
              </button>
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
const activeTab = ref('all');
const orders = ref([]);
const errorMessage = ref('');

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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 獲取餐廳名稱
const getRestaurantName = (order) => {
  if (order.store && typeof order.store === 'object' && order.store.name) {
    return order.store.name;
  }
  return '奔野牛排';
};

// 獲取顯示項目（最多顯示3項）
const getDisplayItems = (items) => {
  if (!items || !Array.isArray(items)) return [];
  
  return items.slice(0, 3).map(item => {
    const name = item.itemId && typeof item.itemId === 'object' ? item.itemId.name : '未知餐點';
    return {
      name,
      amount: item.amount || 1,
      price: item.thisMoney || 0
    };
  });
};

// 獲取總商品數量
const getTotalItems = (items) => {
  if (!items || !Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => total + (item.amount || 1), 0);
};

// 獲取訂單狀態文字
const getStatusText = (status) => {
  switch (status) {
    case 'Unpaid':
      return '待付款';
    case 'Completed':
      return '已完成';
    case 'Canceled':
      return '已取消';
    default:
      return status;
  }
};

// 獲取訂單狀態標籤樣式
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Unpaid':
      return 'bg-warning text-dark';
    case 'Completed':
      return 'bg-success';
    case 'Canceled':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
};

// 根據當前標籤過濾訂單
const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value;
  } else if (activeTab.value === 'unpaid') {
    return orders.value.filter(order => order.orderStatus === 'Unpaid');
  } else if (activeTab.value === 'completed') {
    return orders.value.filter(order => order.orderStatus === 'Completed');
  }
  return orders.value;
});

// 查看訂單詳情
const viewOrderDetail = (order) => {
  router.push(`/confirmation/${order._id}`);
};

// 獲取訂單資訊
const fetchOrders = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';

    // 呼叫 API 獲取客戶訂單
    try {
      const response = await api.customer.getOrders();
      
      if (response.data.success) {
        orders.value = response.data.orders || [];
      } else {
        console.error('獲取訂單失敗:', response.data.message);
        errorMessage.value = response.data.message || '獲取訂單失敗，請稍後再試。';
        // 使用模擬數據
        useMockData();
      }
    } catch (error) {
      console.error('獲取訂單失敗:', error);
      if (error.response) {
        errorMessage.value = error.response.data.message || '獲取訂單失敗，請稍後再試。';
      } else if (error.request) {
        errorMessage.value = '無法連線到伺服器，請檢查您的網路連接。';
      } else {
        errorMessage.value = '獲取訂單失敗，請稍後再試。';
      }
      // 使用模擬數據
      useMockData();
    }
  } finally {
    isLoading.value = false;
  }
};

// 使用模擬數據（當 API 請求失敗時）
const useMockData = () => {
  orders.value = [
    {
      _id: '1',
      orderNumber: 'O2023101501',
      createdAt: '2023-10-15T18:30:00',
      orderStatus: 'Completed',
      pickupMethod: '內用',
      items: [
        {
          itemId: { name: '美國頂級牛排' },
          amount: 1,
          thisMoney: 450
        },
        {
          itemId: { name: '德國豬腳' },
          amount: 1,
          thisMoney: 350
        },
        {
          itemId: { name: '凱薩沙拉' },
          amount: 1,
          thisMoney: 120
        },
        {
          itemId: { name: '紅酒' },
          amount: 2,
          thisMoney: 300
        }
      ],
      totalMoney: 1220,
      store: { name: '奔野牛排 信義店' }
    },
    {
      _id: '2',
      orderNumber: 'O2023101001',
      createdAt: '2023-10-10T12:15:00',
      orderStatus: 'Completed',
      pickupMethod: '自取',
      items: [
        {
          itemId: { name: 'T骨牛排' },
          amount: 2,
          thisMoney: 900
        },
        {
          itemId: { name: '松露薯條' },
          amount: 1,
          thisMoney: 150
        }
      ],
      totalMoney: 1050,
      store: { name: '奔野牛排 西門店' }
    },
    {
      _id: '3',
      orderNumber: 'O2023102001',
      createdAt: '2023-10-20T19:45:00',
      orderStatus: 'Unpaid',
      pickupMethod: '內用',
      items: [
        {
          itemId: { name: '和牛漢堡排' },
          amount: 1,
          thisMoney: 280
        },
        {
          itemId: { name: '起司薯條' },
          amount: 1,
          thisMoney: 120
        }
      ],
      totalMoney: 400,
      store: { name: '奔野牛排 信義店' }
    }
  ];
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.orders-container {
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

.order-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.order-card:hover {
  transform: translateY(-2px);
}

.order-card .card {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.divider {
  height: 1px;
  background-color: #e0e0e0;
}

.card-header {
  border-bottom: 1px solid #f0f0f0;
}
</style>