<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error" class="alert alert-danger">
    {{ error }}
  </div>
  <template v-else>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Edit {{ formTitle }}: {{ dishData.name }}</h2>
      <button class="btn btn-danger" @click="handleDelete">Delete {{ formTitle }}</button>
    </div>

    <BaseDishForm
      :form-title="formTitle"
      :api-endpoint="apiEndpoint"
      :initial-data="dishData"
      :requires-image="requiresImage"
      :requires-description="requiresDescription"
      :is-edit="true"
      :item-id="itemId"
      @cancel="goToList"
      @delete="handleDelete"
    />
  </template>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import BaseDishForm from '../DishAdd/BaseDishForm.vue';

const props = defineProps({
  formTitle: { type: String, required: true },
  apiEndpoint: { type: String, required: true },
  requiresImage: { type: Boolean, default: true },
  requiresDescription: { type: Boolean, default: true }
});

const route = useRoute();
const router = useRouter();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 路由參數
const itemId = route.params.id;

// 狀態
const loading = ref(true);
const error = ref(null);
const dishData = ref({});

// 獲取餐點資料
const fetchDishData = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`${API_BASE_URL}/dish/${props.apiEndpoint}/${itemId}`);
    dishData.value = response.data;
    loading.value = false;
  } catch (err) {
    error.value = `Error loading ${props.formTitle.toLowerCase()} data: ${err.message}`;
    loading.value = false;
  }
};

// 刪除餐點
const handleDelete = async () => {
  if (!confirm(`Are you sure you want to delete this ${props.formTitle.toLowerCase()}?`)) {
    return;
  }

  try {
    await axios.delete(`${API_BASE_URL}/dish/${props.apiEndpoint}/${itemId}`);
    router.push('/admin/dish/show');
  } catch (error) {
    console.error(`Error deleting ${props.formTitle.toLowerCase()}:`, error);
    alert(`Failed to delete ${props.formTitle.toLowerCase()}. Please try again.`);
  }
};

// 返回列表頁
const goToList = () => {
  router.push('/admin/dish/show');
};

// 初始化
onMounted(fetchDishData);
</script>