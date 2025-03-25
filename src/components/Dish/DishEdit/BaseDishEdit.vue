<template>
  <div v-if="loading" class="d-flex justify-content-center align-items-center p-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">載入中...</span>
    </div>
    <span class="ms-3">載入中...</span>
  </div>
  <div v-else-if="error" class="alert alert-danger">
    {{ error }}
  </div>
  <template v-else>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>編輯{{ formTitle }}: {{ dishData.name }}</h2>
      <button class="btn btn-danger" @click="handleDelete">刪除{{ formTitle }}</button>
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
import api from '@/api';
import BaseDishForm from '../DishAdd/BaseDishForm.vue';

const props = defineProps({
  formTitle: { type: String, required: true },
  apiEndpoint: { type: String, required: true },
  requiresImage: { type: Boolean, default: true },
  requiresDescription: { type: Boolean, default: true }
});

const route = useRoute();
const router = useRouter();

// 路由參數
const itemId = route.params.id;
const type = route.params.type; // 取得餐點類型 (mainDish, elseDish, addon, rawMeat)

// 狀態
const loading = ref(true);
const error = ref(null);
const dishData = ref({});

// 獲取餐點資料
const fetchDishData = async () => {
  loading.value = true;
  error.value = null; // 清空錯誤訊息

  try {
    // 使用更新後的 dish API 模組
    const response = await api.dish.getById(props.apiEndpoint, itemId);
    
    if (response.data.success) {
      // API 回傳成功
      dishData.value = response.data.dish;
    } else {
      // API 回傳失敗
      error.value = response.data.message || `無法載入${props.formTitle}資料`;
    }
  } catch (err) {
    console.error(`載入${props.formTitle}資料錯誤:`, err);
    
    if (err.response) {
      // 伺服器有回應但狀態碼不是 2xx
      error.value = err.response.data.message || `載入${props.formTitle}資料失敗`;
    } else if (err.request) {
      // 沒有收到伺服器的回應（可能是網路錯誤）
      error.value = '無法連線到伺服器';
    } else {
      // 其他錯誤（例如程式錯誤）
      error.value = `發生錯誤，請稍後再試`;
    }
  } finally {
    loading.value = false;
  }
};

// 刪除餐點
const handleDelete = async () => {
  if (!confirm(`確定要刪除這個${props.formTitle}嗎？`)) {
    return;
  }

  try {
    const response = await api.dish.delete(props.apiEndpoint, itemId);
    
    if (response.data.success) {
      // 刪除成功，導航回列表頁
      router.push('/admin/dish/show');
    } else {
      // API 回傳失敗
      alert(response.data.message || `刪除${props.formTitle}失敗`);
    }
  } catch (err) {
    console.error(`刪除${props.formTitle}錯誤:`, err);
    
    if (err.response) {
      // 伺服器有回應但狀態碼不是 2xx
      alert(err.response.data.message || `刪除${props.formTitle}失敗`);
    } else if (err.request) {
      // 沒有收到伺服器的回應（可能是網路錯誤）
      alert('無法連線到伺服器');
    } else {
      // 其他錯誤
      alert(`發生錯誤，請稍後再試`);
    }
  }
};

// 返回列表頁
const goToList = () => {
  router.push('/admin/dish/show');
};

// 初始化
onMounted(fetchDishData);
</script>