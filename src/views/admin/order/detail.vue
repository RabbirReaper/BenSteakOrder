<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center my-4">
      <h1>{{ formatDate(dateParam) }} 訂單詳情</h1>
      <router-link to="/admin/orders" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left"></i> 返回訂單列表
      </router-link>
    </div>

    <!-- 讀取中狀態 -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p>正在載入訂單資料...</p>
    </div>

    <!-- 無資料提示 -->
    <div v-else-if="dayOrders.length === 0" class="alert alert-info text-center my-5">
      <i class="bi bi-info-circle-fill me-2"></i>
      <span>當天沒有訂單資料</span>
    </div>

    <template v-else> 
      <!-- 圖表區域 -->
      <div class="row mb-4">
        <div class="col-md-6 mb-3">
          <div class="card h-100">
            <div class="card-header">利潤與手續費比率</div>
            <div class="card-body" v-if="profitInfo.profit">
              <ProfitFeesPieChart :profits="profitInfo.profit" :fees="profitInfo.fees" />
            </div>
          </div>
        </div>
        <div class="col-md-6 mb-3">
          <div class="card h-100">
            <div class="card-header">訂單類型占比</div>
            <div class="card-body">
              <OrderTypesPieChart :order-types="orderTypeCounts" />
            </div>
          </div>
        </div>
        <div class="col-md-6 mb-3">
          <div class="card h-100">
            <div class="card-header">餐點銷量排行</div>
            <div class="card-body">
              <DishSalesBarChart :dish-sales="dishSalesData" />
            </div>
          </div>
        </div>
        <div class="col-md-6 mb-3">
          <div class="card h-100">
            <div class="card-header">營業繁忙時段</div>
            <div class="card-body">
              <HourlyOrdersLineChart :hourly-data="hourlyOrdersData" />
            </div>
          </div>
        </div>
      </div>

      <!-- 訂單列表 -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">訂單列表 ({{ dayOrders.length }} 筆)</h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>店家</th>
                  <th>訂單號</th>
                  <th>平台</th>
                  <th>取餐方式</th>
                  <th>付款方式</th>
                  <th>總金額</th>
                  <th>狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in dayOrders" :key="order._id">
                  <td>{{ order.store?.name || '未知店家' }}</td>
                  <td>{{ order.orderNumber }}</td>
                  <td>{{ order.platform }}</td>
                  <td>
                    <span :class="getPickupMethodClass(order.pickupMethod)">
                      {{ order.pickupMethod }}
                    </span>
                  </td>
                  <td>{{ order.paymentMethod }}</td>
                  <td>${{ order.totalMoney.toLocaleString('en-US') }}</td>
                  <td>
                    <span :class="getOrderStatusClass(order.orderStatus)">
                      {{ formatOrderStatus(order.orderStatus) }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-primary" @click="viewOrderDetails(order)">
                      詳情
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 訂單詳情 Modal -->
      <OrderDetailModal :order="selectedOrder" :visible="showOrderModal" @close="showOrderModal = false" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import ProfitFeesPieChart from '@/components/admin/charts/ProfitFeesPieChart.vue';
import OrderTypesPieChart from '@/components/admin/charts/OrderTypesPieChart.vue';
import DishSalesBarChart from '@/components/admin/charts/DishSalesBarChart.vue';
import HourlyOrdersLineChart from '@/components/admin/charts/HourlyOrdersLineChart.vue';
import OrderDetailModal from '@/components/admin/OrderDetailModal.vue';

const route = useRoute();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 初始化狀態變數
const dateParam = ref(route.params.date);
const dayOrders = ref([]);
const loading = ref(true);
const selectedOrder = ref(null);
const showOrderModal = ref(false);



// 獲取當天訂單資料
const fetchDayOrders = async () => {
  loading.value = true;

  try {
    const startDate = new Date(dateParam.value);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateParam.value);
    endDate.setHours(23, 59, 59, 999);

    const response = await axios.get(`${API_BASE_URL}/order`, {
      params: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });
    // console.log(response.data)

    dayOrders.value = response.data;
    // console.log('daysorders:',dayOrders.value)
  } catch (error) {
    console.error('獲取當天訂單資料失敗:', error);
    alert('獲取當天訂單資料失敗，請重試');
  } finally {
    loading.value = false;
  }
};

// 計算利潤信息
const profitInfo = computed(() => {
  if (dayOrders.value.length === 0) {
    return { total: 0, fees: 0, profit: 0 };
  }

  let totalIncome = 0;
  let totalFees = 0;

  dayOrders.value.forEach(order => {
    if(order.orderStatus === 'Canceled') return;
    totalIncome += order.totalMoney || 0;
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
    totalFees += fee;
  });

  return {
    total: totalIncome,
    fees: totalFees,
    profit: totalIncome - totalFees
  };
});

// 計算訂單類型數量
const orderTypeCounts = computed(() => {
  const typeCounts = {
    '內用': 0,
    '自取': 0,
    'FoodPanda': 0,
    'UberEat': 0
  };

  if (dayOrders.value.length === 0) {
    return typeCounts;
  }

  dayOrders.value.forEach(order => {
    if(order.orderStatus === 'Canceled') return;
    if (order.pickupMethod === '內用') {
      typeCounts['內用']++;
    } else if (order.pickupMethod === '自取') {
      typeCounts['自取']++;
    } else if (order.platform === 'FoodPanda') {
      typeCounts['FoodPanda']++;
    } else if (order.platform === 'UberEat') {
      typeCounts['UberEat']++;
    }
  });

  return typeCounts;
});

// 然後修改 dishSalesData 計算屬性
const dishSalesData = computed(() => {
  if (dayOrders.value.length === 0) {
    return [];
  }

  const dishSales = {};

  dayOrders.value.forEach(order => {
    if (!order.items) return;
    if(order.orderStatus === 'Canceled') return;

    order.items.forEach(item => {
      
      const dishName = item.itemId.name

      if (!dishSales[dishName]) {
        dishSales[dishName] = 0;
      }

      dishSales[dishName] += item.amount || 1;

      // 加點肉品需加到那個肉品的銷量統計
      if (item.options?.additionalMeats && item.options.additionalMeats.length > 0) {
        item.options.additionalMeats.forEach(meat => {
          // // 判斷 meat 是 ID 字串還是物件
          const meatName = meat.name ;

          if (!dishSales[meatName]) {
            dishSales[meatName] = 0;
          }

          dishSales[meatName] += item.amount || 1;
        });
      }
    });
  });

  // 轉換為陣列格式用於繪圖
  return Object.entries(dishSales).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count); // 按銷量排序
});

// 計算每半小時的訂單數量
const hourlyOrdersData = computed(() => {
  if (dayOrders.value.length === 0) {
    return [];
  }

  const hourlyData = {};

  // 初始化每半小時的時間段
  for (let hour = 0; hour < 24; hour++) {
    for (let half = 0; half < 2; half++) {
      const timeKey = `${hour.toString().padStart(2, '0')}:${half === 0 ? '00' : '30'}`;
      hourlyData[timeKey] = 0;
    }
  }

  dayOrders.value.forEach(order => {
    if (!order.createdAt || !order.items) return;
    if(order.orderStatus === 'Canceled') return;

    const orderTime = new Date(order.createdAt);
    const hour = orderTime.getHours();
    const minute = orderTime.getMinutes();
    const half = minute < 30 ? 0 : 1;

    const timeKey = `${hour.toString().padStart(2, '0')}:${half === 0 ? '00' : '30'}`;
    
    // 計算主餐數量而不是訂單數量
    const mainDishCount = order.items.reduce((count, item) => {
      // 判斷是否為主餐，增加相應數量
      if (item.itemModel === 'MainDish') {
        return count + item.amount + item.amount*(item.options?.additionalMeats?.length || 0);
      }
      return count + 1;
    }, 0);
    
    // 如果沒有主餐，至少計為 1，表示這個時段有訂單
    hourlyData[timeKey] += mainDishCount > 0 ? mainDishCount : 1;
  });

  // 轉換為陣列格式
  return Object.entries(hourlyData)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => {
      const [aHour, aMin] = a.time.split(':').map(Number);
      const [bHour, bMin] = b.time.split(':').map(Number);

      if (aHour !== bHour) return aHour - bHour;
      return aMin - bMin;
    });
});

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
};

// 獲取取餐方式的樣式類別
const getPickupMethodClass = (method) => {
  const classes = {
    '內用': 'badge text-bg-primary',
    '自取': 'badge text-bg-success',
    '外送': 'badge text-bg-warning'
  };

  return classes[method] || 'badge text-bg-secondary';
};

// 獲取訂單狀態的樣式類別
const getOrderStatusClass = (status) => {
  const classes = {
    'Unpaid': 'badge text-bg-warning',
    'Completed': 'badge text-bg-success',
    'Canceled': 'badge text-bg-danger'
  };

  return classes[status] || 'badge text-bg-secondary';
};

// 格式化訂單狀態
const formatOrderStatus = (status) => {
  const statusMap = {
    'Unpaid': '未結帳',
    'Completed': '已完成',
    'Canceled': '已取消'
  };

  return statusMap[status] || status;
};

// 查看訂單詳情
const viewOrderDetails = (order) => {
  selectedOrder.value = order;
  showOrderModal.value = true;
};


// 組件掛載時初始化
onMounted(async () => {
  // await fetchAllDishes();
  await fetchDayOrders();
  // console.log(profitInfo.value.profit)
});
</script>

<style scoped>
.chart-container {
  height: 300px;
}
</style>