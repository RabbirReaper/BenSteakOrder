<template>
  <div class="points-container p-3">
    <!-- 頂部導航 -->
    <div class="top-nav d-flex align-items-center py-3">
      <button class="btn btn-link text-dark p-0" @click="goBack">
        <i class="bi bi-arrow-left fs-4"></i>
      </button>
      <h5 class="mb-0 mx-auto">我的點數</h5>
    </div>

    <!-- 點數卡片 -->
    <div class="points-card bg-primary text-white p-4 rounded-3 mb-4">
      <h6 class="text-uppercase mb-2">目前可用點數</h6>
      <div class="d-flex align-items-baseline">
        <h2 class="mb-0 me-2">{{ userPoints }}</h2>
        <span>點</span>
      </div>
      <p class="mt-2 mb-0">
        <small>使用點數可折抵消費金額，每 10 點折抵 1 元</small>
      </p>
    </div>

    <!-- 點數歷史 -->
    <div class="points-history">
      <h6 class="section-title mb-3">點數紀錄</h6>

      <div v-if="isLoading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">載入中...</p>
      </div>

      <div v-else-if="pointsHistory.length === 0" class="text-center py-4">
        <div class="empty-state">
          <i class="bi bi-card-list fs-1 text-muted"></i>
          <p class="mt-2 text-muted">尚無點數紀錄</p>
        </div>
      </div>

      <div v-else class="history-list">
        <div v-for="(record, index) in pointsHistory" :key="index" class="history-item card mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="mb-1">{{ record.description }}</h6>
                <p class="text-muted mb-0 small">{{ formatDate(record.date) }}</p>
              </div>
              <span :class="record.points > 0 ? 'text-success' : 'text-danger'">
                {{ record.points > 0 ? '+' : '' }}{{ record.points }} 點
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';

const router = useRouter();
const isLoading = ref(true);
const userPoints = ref(0);
const pointsHistory = ref([]);

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

// 獲取點數資訊
const fetchPointsData = async () => {
  try {
    isLoading.value = true;
    
    // 這裡應該調用實際的 API 來獲取點數資訊
    // 模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 模擬數據
    userPoints.value = 1500;
    pointsHistory.value = [
      {
        description: '消費獲得點數 - 訂單 #12345',
        date: new Date('2023-10-15T18:30:00'),
        points: 200
      },
      {
        description: '生日禮遇點數',
        date: new Date('2023-09-20T12:00:00'),
        points: 500
      },
      {
        description: '點數折抵 - 訂單 #12300',
        date: new Date('2023-09-12T19:45:00'),
        points: -100
      },
      {
        description: '消費獲得點數 - 訂單 #12300',
        date: new Date('2023-09-12T19:45:00'),
        points: 150
      },
      {
        description: '新會員禮遇點數',
        date: new Date('2023-08-01T10:30:00'),
        points: 1000
      }
    ];
    
  } catch (error) {
    console.error('獲取點數資訊失敗:', error);
    alert('獲取點數資訊失敗，請稍後再試。');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchPointsData();
});
</script>

<style scoped>
.points-container {
  padding-bottom: 2rem;
}

.top-nav {
  position: relative;
}

.points-card {
  background: linear-gradient(135deg, #4a7dde, #7d6ade);
  border-radius: 15px;
}

.section-title {
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.history-item {
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.history-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
}
</style>