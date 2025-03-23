<template>
  <div class="container-fluid">
    <h1 class="mb-4">促銷管理</h1>

    <!-- Tab 導航 -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <button class="nav-link" :class="{ active: activeTab === 'pointSystem' }" @click="activeTab = 'pointSystem'">
          點數系統設定
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: activeTab === 'coupon' }" @click="activeTab = 'coupon'">
          優惠券管理
        </button>
      </li>
    </ul>

    <!-- Tab 內容 -->
    <div class="tab-content">
      <!-- 點數系統設定 -->
      <div v-show="activeTab === 'pointSystem'" class="tab-pane fade show active">
        <PointSystemList />
      </div>

      <!-- 優惠券管理 -->
      <div v-show="activeTab === 'coupon'" class="tab-pane fade show active">
        <CouponList />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PointSystemList from '@/components/Admin/Promotion/PointSystemList.vue';
import CouponList from '@/components/Admin/Promotion/CouponList.vue';

// 當前激活的 Tab
const activeTab = ref('pointSystem');
</script>

<style scoped>
.nav-tabs .nav-link {
  cursor: pointer;
}

.tab-pane {
  padding-top: 1.5rem;
}
</style>