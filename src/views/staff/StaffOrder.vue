<template>
  <div class="staff-order-page">
    <StaffOrderMain :store-id="storeId" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import StaffOrderMain from '@/components/Staff/StaffOrderMain.vue';

const route = useRoute();
const storeId = ref(route.params.storeId || '1'); // 預設使用 ID 1 如果沒有提供
</script>

<style>
.staff-order-page {
  height: 100vh;
  overflow: hidden;
}
</style>