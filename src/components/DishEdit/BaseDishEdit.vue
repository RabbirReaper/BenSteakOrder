<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error" class="alert alert-danger">
    {{ error }}
  </div>
  <template v-else>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Edit {{ formTitle }}: {{ formData.name }}</h2>
      <button class="btn btn-danger" @click="handleDelete">Delete {{ formTitle }}</button>
    </div>

    <BaseDishForm
      :form-title="formTitle"
      :api-endpoint="apiEndpoint"
      :requires-image="requiresImage"
      :requires-description="requiresDescription"
      :is-edit="true"
      :item-id="id"
      :initial-data="formData"
      @cancel="handleCancel"
    >
      <template v-if="$slots['additional-fields']" #additional-fields>
        <slot name="additional-fields" :form-data="formData" :errors="errors"></slot>
      </template>
    </BaseDishForm>
  </template>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import BaseDishForm from '../DishAdd/BaseDishForm.vue';

const props = defineProps({
  id: { type: String, required: true },
  formTitle: { type: String, required: true },
  apiEndpoint: { type: String, required: true },
  requiresImage: { type: Boolean, default: true },
  requiresDescription: { type: Boolean, default: true }
});

const router = useRouter();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const loading = ref(true);
const error = ref(null);
const formData = ref({});
const errors = ref({});

// 提供數據給子組件
provide('formData', formData);
provide('errors', errors);

// 獲取數據
const fetchData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dish/${props.apiEndpoint}/${props.id}`);
    formData.value = response.data;
    loading.value = false;
  } catch (err) {
    error.value = `Error loading ${props.formTitle.toLowerCase()} data: ${err.message}`;
    loading.value = false;
  }
};

// 刪除
const handleDelete = async () => {
  if (!confirm(`Are you sure you want to delete this ${props.formTitle.toLowerCase()}?`)) {
    return;
  }

  try {
    await axios.delete(`${API_BASE_URL}/dish/${props.apiEndpoint}/${props.id}`);
    router.push('/admin/dish/show');
  } catch (error) {
    console.error(`Error deleting ${props.formTitle.toLowerCase()}:`, error);
    alert(`Failed to delete ${props.formTitle.toLowerCase()}. Please try again.`);
  }
};

// 取消
const handleCancel = () => {
  router.push('/admin/dish/show');
};

onMounted(fetchData);
</script>