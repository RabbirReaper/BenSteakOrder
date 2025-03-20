<template>
  <div class="main-container">
    <div class="center-container">
      <CustomerOrdering :store-id="storeId" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import CustomerOrdering from '@/components/Customer/Ordering.vue';

const route = useRoute();
const storeId = ref(route.params.store_id);
</script>

<style scoped>
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