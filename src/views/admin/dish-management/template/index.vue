<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>餐點模板列表</h2>
      <router-link :to="{ name: 'admin-dish-template-edit', params: { id: 'new' } }" class="btn btn-primary">
        新增餐點模板
      </router-link>
    </div>

    <!-- 載入中提示 -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p class="mt-2">載入中...</p>
    </div>

    <!-- 錯誤訊息 -->
    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
      <button @click="fetchTemplates" class="btn btn-sm btn-outline-danger ms-2">重試</button>
    </div>

    <!-- 餐點模板卡片網格 -->
    <div v-else class="row row-cols-1 row-cols-md-3 g-4">
      <div v-for="template in templates" :key="template._id" class="col">
        <div class="card h-100 hover-shadow" style="cursor: pointer;" @click="goToEdit(template._id)">
          <img v-if="template.image?.url" :src="template.image.url" :alt="template.image.alt" class="card-img-top"
            style="height: 200px; object-fit: cover;">
          <div v-else class="card-img-top bg-light d-flex justify-content-center align-items-center"
            style="height: 200px;">
            <span class="text-muted">無圖片</span>
          </div>
          <div class="card-body">
            <h5 class="card-title">{{ template.name }}</h5>
            <p class="card-text">${{ template.basePrice }}</p>
            <p class="card-text">
              <span class="badge bg-success me-1" v-if="template.isAvailable">上架中</span>
              <span class="badge bg-secondary me-1" v-else>已下架</span>
              <span v-if="template.actualStock > 0" class="badge bg-info">庫存: {{ template.actualStock }}</span>
              <span v-else-if="template.actualStock === 0" class="badge bg-danger">售罄</span>
              <span v-else class="badge bg-warning text-dark">無庫存限制</span>
            </p>
          </div>
        </div>
      </div>

      <!-- 無資料提示 -->
      <div v-if="templates.length === 0" class="col-12">
        <div class="text-center py-5 text-muted">
          <p>目前沒有餐點模板</p>
          <router-link :to="{ name: 'admin-dish-template-edit', params: { id: 'new' } }" class="btn btn-primary">
            新增第一個餐點模板
          </router-link>
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
const templates = ref([]);
const loading = ref(true);
const error = ref(null);

// 獲取所有餐點模板
const fetchTemplates = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await api.dishTemplate.getAll();
    
    if (response.data.success) {
      templates.value = response.data.templates || [];
    } else {
      error.value = response.data.message || '獲取餐點模板列表失敗';
    }
  } catch (err) {
    console.error('Error fetching dish templates:', err);
    
    if (err.response) {
      error.value = err.response.data.message || '伺服器回應錯誤';
    } else if (err.request) {
      error.value = '無法連線到伺服器';
    } else {
      error.value = '發生錯誤，請稍後再試';
    }
  } finally {
    loading.value = false;
  }
};

// 跳轉到編輯頁面
const goToEdit = (id) => {
  router.push({ name: 'admin-dish-template-edit', params: { id } });
};

onMounted(() => {
  fetchTemplates();
});
</script>

<style scoped>
.hover-shadow {
  transition: box-shadow 0.3s ease;
}

.hover-shadow:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}
</style>