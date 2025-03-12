<template>
  <div class="container-fluid">
    <h1 class="my-4">訂單列表</h1>

    <!-- 上方選擇和設定部分 (20% 高度) -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text">顯示天數</span>
              <select class="form-select" v-model="dayRange" @change="updateDateRangeAndFetch">
                <option :value="1">1 天</option>
                <option :value="10">10 天</option>
                <option :value="30">30 天</option>
              </select>
            </div>
          </div>
          <div class="col-md-4 text-center">
            <div class="btn-group">
              <button class="btn btn-primary" @click="moveDateRange(-1)">
                <i class="bi bi-arrow-left"></i> 往前
              </button>
              <button class="btn btn-primary" @click="moveDateRange(1)">
                往後 <i class="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
          <div class="col-md-4 text-end">
            <div class="date-range-display">
              {{ formatDate(startDate) }} 至 {{ formatDate(endDate) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 讀取中狀態 -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p>正在載入訂單資料...</p>
    </div>

    <!-- 無資料提示 -->
    <div v-else-if="ordersByDate.length === 0" class="alert alert-info text-center my-5">
      <i class="bi bi-info-circle-fill me-2"></i>
      <span>所選時間範圍內沒有訂單資料</span>
    </div>

    <!-- 下方顯示訂單部分 (80% 高度) -->
    <div v-else class="row">
      <div v-for="dayData in ordersByDate" :key="dayData.date" class="col-md-4 mb-4">
        <div class="card h-100 order-day-card" @click="viewDayDetails(dayData.date)">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">{{ formatDate(dayData.date) }}</h5>
            <span class="badge text-bg-success fs-6">${{ dayData.profit }}</span>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-6">
                <h6>總收入</h6>
                <p class="text-success">${{ dayData.totalIncome }}</p>
              </div>
              <div class="col-6">
                <h6>手續費</h6>
                <p class="text-danger">${{ dayData.fees }}</p>
              </div>
            </div>
            <div class="row mt-2">
              <div class="col-6">
                <h6>訂單數</h6>
                <p>{{ dayData.orders.length }}</p>
              </div>
              <div class="col-6">
                <h6>平均訂單</h6>
                <p>${{ dayData.orders.length ? Math.round(dayData.totalIncome / dayData.orders.length) : 0 }}</p>
              </div>
            </div>
          </div>
          <div class="card-footer text-muted">
            <small>點擊查看詳細資料</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 狀態變數
const dayRange = ref(10);
const startDate = ref(new Date());
const endDate = ref(new Date());
const orders = ref([]);
const loading = ref(true);

// 計算日期範圍
const calculateDateRange = () => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  endDate.value = end;

  const start = new Date();
  start.setDate(start.getDate() - dayRange.value + 1);
  start.setHours(0, 0, 0, 0);
  startDate.value = start;
};

const updateDateRangeAndFetch = () => {
  calculateDateRange();
  fetchOrdersData();
};

// 移動日期範圍
const moveDateRange = (direction) => {
  // direction: 1 表示往後，-1 表示往前
  const days = dayRange.value * direction;

  const newEnd = new Date(endDate.value);
  newEnd.setDate(newEnd.getDate() - days);
  endDate.value = newEnd;

  const newStart = new Date(newEnd);
  newStart.setDate(newStart.getDate() - dayRange.value + 1);
  newStart.setHours(0, 0, 0, 0);
  startDate.value = newStart;

  fetchOrdersData();
};

// 按日期分組的訂單
const ordersByDate = computed(() => {
  const groupedByDate = {};

  orders.value.forEach(order => {
    if (order.orderStatus === 'Canceled') return;

    // 修改後
    const orderDate = new Date(order.createdAt);
    // 加上8小時的時區偏移
    const taiwanDate = new Date(orderDate.getTime() + 8 * 60 * 60 * 1000);
    const dateKey = taiwanDate.toISOString().split('T')[0];

    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = {
        date: dateKey,
        orders: [],
        totalIncome: 0,
        fees: 0,
        profit: 0
      };
    }

    groupedByDate[dateKey].orders.push(order);
    groupedByDate[dateKey].totalIncome += order.totalMoney || 0;

    // 計算手續費
    let feeRate = 0;
    switch (order.paymentMethod) {
      case 'linepay':
        feeRate = 0.03;
        break;
      case 'FoodPanda':
        feeRate = 0.25;
        break;
      case 'UberEat':
        feeRate = 0.33;
        break;
      default:
        feeRate = 0;
    }

    const fee = Math.floor((order.totalMoney || 0) * feeRate);
    groupedByDate[dateKey].fees += fee;
    groupedByDate[dateKey].profit = groupedByDate[dateKey].totalIncome - groupedByDate[dateKey].fees;
  });

  // 將物件轉為陣列並按日期排序
  return Object.values(groupedByDate).sort((a, b) => new Date(b.date) - new Date(a.date));
});

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
};

// 查看當天詳細資料
const viewDayDetails = (date) => {
  router.push(`/admin/orders/${date}`);
};

// 獲取訂單資料
const fetchOrdersData = async () => {
  loading.value = true;

  try {
    const response = await axios.get(`${API_BASE_URL}/order`, {
      params: {
        start: startDate.value,
        end: endDate.value
      }
    });

    orders.value = response.data;
  } catch (error) {
    console.error('獲取訂單資料失敗:', error);
    alert('獲取訂單資料失敗，請重試');
  } finally {
    loading.value = false;
  }
};

// 組件掛載時初始化
onMounted(() => {
  calculateDateRange();
  fetchOrdersData();
});
</script>

<style scoped>
.order-day-card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.order-day-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.date-range-display {
  font-weight: bold;
  font-size: 1.1rem;
}
</style>