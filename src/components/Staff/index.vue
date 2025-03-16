<template>
  <div class="container-fluid h-100">
    <div class="row h-100">
      <!-- 左側邊欄 -->
      <div class="col-md-1 bg-dark text-white sidebar py-3 d-flex flex-column">
        <button class="btn mb-3" :class="orderStore.activeComponent === 'DineIn' ? 'btn-primary' : 'btn-outline-light'"
          @click="orderStore.setActiveComponent('DineIn')">
          內用
        </button>
        <button class="btn mb-3" :class="orderStore.activeComponent === 'TakeOut' ? 'btn-primary' : 'btn-outline-light'"
          @click="orderStore.setActiveComponent('TakeOut')">
          外帶
        </button>
        <button class="btn mb-3" :class="orderStore.activeComponent === 'Orders' ? 'btn-primary' : 'btn-outline-light'"
          @click="orderStore.setActiveComponent('Orders')">
          訂單
        </button>
        <button class="btn btn-warning mt-auto" @click="refreshData">更新資料</button>
      </div>

      <!-- 中間內容區 -->
      <div class="col-md-8 p-0"
        :class="{ 'main-content': orderStore.activeComponent === 'Orders', 'main-content-rigid': orderStore.activeComponent !== 'Orders' }">
        <component :is="currentActiveComponent" :store-id="storeId" />
      </div>

      <!-- 右側邊欄 - 使用新元件 -->
      <div class="col-md-3 p-2">
        <OrderCart :active-component="orderStore.activeComponent" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, markRaw, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOrderStore } from '@/stores/order';
import DineIn from './DineIn/DineIn.vue';
import TakeOut from './TakeOut/TakeOut.vue';
import Orders from './OrderList/OrderList.vue';
import OrderCart from './OrderCart/index.vue';

// 路由和API設定
const route = useRoute();
const router = useRouter();
const storeId = route.params.storeId;

// 使用 Pinia store
const orderStore = useOrderStore();

// 使用 shallowRef 來儲存元件引用，避免 Vue 深度觀察組件對象
const componentMap = {
  DineIn: markRaw(DineIn),
  TakeOut: markRaw(TakeOut),
  Orders: markRaw(Orders)
};

// 計算屬性獲取當前活動組件
const currentActiveComponent = computed(() => {
  return componentMap[orderStore.activeComponent];
});

// 重新整理數據
const refreshData = async () => {
  await orderStore.refreshData(storeId);
};

// 生命周期鉤子
onMounted(async () => {
  await orderStore.fetchMenuData();
  await orderStore.fetchTodayOrders(storeId);
});
</script>

<style scoped>
.h-100 {
  height: 100vh;
}

.sidebar {
  height: 100vh;
  overflow-y: auto;
}

.main-content {
  height: 100vh;
  overflow-y: auto;
}

.main-content-rigid {
  height: auto;
  overflow-y: auto;
}
</style>