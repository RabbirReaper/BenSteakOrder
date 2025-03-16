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
      <div v-if="loading" class="col-12 text-center">
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
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>分店名稱</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="store in stores" :key="store._id">
                <td>{{ store.name }}</td>
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
                      @click="handleDelete(store._id)"
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
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const stores = ref([])
const loading = ref(true)

// 獲取所有店家資料
const fetchStores = async () => {
  try {
    loading.value = true
    const response = await axios.get(`${API_BASE_URL}/store`)
    stores.value = response.data
  } catch (error) {
    console.error('獲取店家資料失敗:', error)
    alert('獲取店家資料失敗')
  } finally {
    loading.value = false
  }
}

// 刪除店家
const handleDelete = async (storeId) => {
  if (!confirm('確定要刪除這個店家嗎？')) return

  try {
    await axios.delete(`${API_BASE_URL}/store/${storeId}`)
    await fetchStores() // 重新獲取列表
    // alert('刪除成功')
  } catch (error) {
    console.error('刪除店家失敗:', error)
    alert('刪除店家失敗')
  }
}

// 組件掛載時獲取資料
onMounted(() => {
  fetchStores()
})
</script>

<style scoped>
.table {
  margin-bottom: 0;
}

.btn-group {
  gap: 0.5rem;
}
</style>