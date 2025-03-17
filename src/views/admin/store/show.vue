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
      <div v-if="storeState.loading" class="col-12 text-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="storeState.stores.length === 0" class="col-12">
        <div class="alert alert-info">
          目前還沒有任何分店資料
        </div>
      </div>

      <div v-else class="col-12">
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
              <tr v-for="store in storeState.stores" :key="store._id">
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
                    >
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter();

// 使用響應式狀態來管理店家數據
const storeState = reactive({
  stores: [],
  loading: true,
  error: null
});

// 獲取所有店家資料
const fetchStores = async () => {
  try {
    storeState.loading = true;
    storeState.error = null;
    
    const response = await api.store.getAll();
    storeState.stores = response.data;
  } catch (error) {
    console.error('獲取店家資料失敗:', error);
    storeState.error = '獲取店家資料失敗，請重試';
    alert('獲取店家資料失敗');
  } finally {
    storeState.loading = false;
  }
};

// 刪除店家
const handleDelete = async (storeId, storeName) => {
  if (!confirm(`確定要刪除「${storeName}」分店嗎？`)) return;

  try {
    await api.store.delete(storeId);
    // 重新獲取店家列表，而不是手動從陣列中移除
    await fetchStores();
  } catch (error) {
    console.error('刪除店家失敗:', error);
    alert('刪除店家失敗');
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