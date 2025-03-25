<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>分店列表</h1>
      <router-link to="./add" class="btn btn-primary">
        新增分店
      </router-link>
    </div>

    <!-- 店家列表 -->
    <div class="row">
      <div v-if="isLoading" class="col-12 text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="stores.length === 0" class="col-12">
        <div class="alert alert-info">
          目前還沒有任何分店資料
        </div>
      </div>

      <div v-else class="col-12">
        <div v-if="errorMessage" class="alert alert-danger mb-3" role="alert">
          {{ errorMessage }}
        </div>
        
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>分店名稱</th>
                <th>公告數量</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="store in stores" :key="store._id">
                <td>{{ store.name }}</td>
                <td>{{ store.announcements?.length || 0 }}</td>
                <td>
                  <div class="btn-group">
                    <router-link 
                      :to="`./${store._id}`" 
                      class="btn btn-sm btn-outline-primary"
                    >
                      編輯
                    </router-link>
                    <button 
                      class="btn btn-sm btn-outline-danger"
                      @click="handleDelete(store._id, store.name)"
                      :disabled="isDeleting === store._id"
                    >
                      <span v-if="isDeleting === store._id" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

// 使用 ref 創建響應式狀態
const stores = ref([]);
const isLoading = ref(true);
const isDeleting = ref(null); // 用來追蹤正在刪除的店家 ID
const errorMessage = ref('');

// 獲取所有店家資料
const fetchStores = async () => {
  errorMessage.value = ''; // 清空錯誤訊息
  isLoading.value = true;
  
  try {
    const response = await api.store.getAll();
    
    if (response.data.success) {
      stores.value = response.data.stores;
    } else {
      errorMessage.value = response.data.message || '獲取店家資料失敗';
    }
  } catch (error) {
    console.error('獲取店家資料失敗:', error);
    
    if (error.response) {
      // 伺服器有回應但狀態碼不是 2xx
      errorMessage.value = error.response.data.message || '獲取店家資料失敗';
    } else if (error.request) {
      // 沒有收到伺服器的回應（可能是網路錯誤）
      errorMessage.value = '無法連線到伺服器';
    } else {
      // 其他錯誤
      errorMessage.value = '發生錯誤，請稍後再試';
    }
  } finally {
    isLoading.value = false;
  }
};

// 刪除店家
const handleDelete = async (storeId, storeName) => {
  if (!confirm(`確定要刪除「${storeName}」分店嗎？`)) return;

  errorMessage.value = ''; // 清空錯誤訊息
  isDeleting.value = storeId; // 設置正在刪除的店家 ID
  
  try {
    const response = await api.store.delete(storeId);
    
    if (response.data.success) {
      // 刪除成功，重新獲取店家列表
      await fetchStores();
    } else {
      errorMessage.value = response.data.message || '刪除店家失敗';
    }
  } catch (error) {
    console.error('刪除店家失敗:', error);
    
    if (error.response) {
      // 伺服器有回應但狀態碼不是 2xx
      errorMessage.value = error.response.data.message || '刪除店家失敗';
    } else if (error.request) {
      // 沒有收到伺服器的回應（可能是網路錯誤）
      errorMessage.value = '無法連線到伺服器';
    } else {
      // 其他錯誤
      errorMessage.value = '發生錯誤，請稍後再試';
    }
  } finally {
    isDeleting.value = null; // 重置刪除狀態
  }
};

// 組件掛載時獲取資料
onMounted(() => {
  fetchStores();
});
</script>

<style scoped>
.table {
  margin-bottom: 0;
}

.btn-group {
  gap: 0.5rem;
}
</style>