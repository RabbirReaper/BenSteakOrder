<template>
  <div class="main-container">
    <div class="center-container">
      <div class="orders-container">
        <h2>今日訂單列表</h2>
        <div v-if="todayOrders && todayOrders.length > 0" class="order-list">
          <div v-for="order in todayOrders" :key="order.id" class="order-item">
            <div class="order-details">
              <span>訂單編號: {{ order.orderNumber }}</span>
              <span>訂購時間: {{ order.updatedAt }}</span>
              <span>總金額: ${{ order.totalPaid }}</span>
              <span>狀態: {{ order.orderStatus }}</span>
            </div>
          </div>
        </div>
        <div v-else class="no-orders">
          今日尚無訂單
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const todayOrders = ref([])


const getOrder = async () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0); // 設定為今天的 00:00:00
  const end = new Date(start.getFullYear(),start.getMonth(),start.getDate()+1);
  try {
    const response = await axios.get(`${API_BASE_URL}/order?start=${start}&end=${end}`)
    console.log(response.data)
    todayOrders.value = response.data
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  }
}

onMounted(async () => {
  await getOrder()
})
</script>

<style lang="css" scoped>
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