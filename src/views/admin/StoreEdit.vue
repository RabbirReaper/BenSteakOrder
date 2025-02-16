<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h2 class="mb-0">編輯店家</h2>
            <button 
              class="btn btn-danger"
              @click="handleDelete"
              :disabled="loading"
            >
              刪除店家
            </button>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <form v-else @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="storeName" class="form-label">店家名稱</label>
                <input
                  type="text"
                  class="form-control"
                  id="storeName"
                  v-model="storeForm.name"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="menuSelect" class="form-label">選擇菜單</label>
                <select 
                  class="form-select"
                  id="menuSelect"
                  v-model="storeForm.menuItem"
                  required
                >
                  <option value="">請選擇菜單</option>
                  <option 
                    v-for="menu in menus" 
                    :key="menu._id"
                    :value="menu._id"
                  >
                    {{ menu.name }}
                  </option>
                </select>
              </div>

              <div class="d-flex justify-content-between">
                <router-link to="./show" class="btn btn-secondary">
                  返回
                </router-link>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  {{ loading ? '儲存中...' : '儲存' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const menus = ref([])

const storeForm = ref({
  name: '',
  menuItem: ''
})

// 獲取所有菜單
const fetchMenus = async () => {
  try {
    const response = await axios.get('/menu')
    menus.value = response.data
  } catch (error) {
    console.error('獲取菜單失敗:', error)
    alert('獲取菜單失敗')
  }
}

// 獲取店家資料
const fetchStore = async () => {
  try {
    loading.value = true
    const storeId = route.params.id
    const { data: storeData } = await axios.get(`/store/${storeId}`)
    
    storeForm.value = {
      name: storeData.name,
      menuItem: storeData.menuItem
    }
  } catch (error) {
    console.error('獲取店家資料失敗:', error)
    alert('獲取店家資料失敗')
    router.push('./show')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  try {
    loading.value = true
    const storeId = route.params.id
    
    await axios.put(`/store/${storeId}`, storeForm.value)
    // alert('更新成功！')
    router.push('./show')
  } catch (error) {
    console.error('更新失敗:', error)
    alert('更新失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('確定要刪除這個店家嗎？')) return

  try {
    loading.value = true
    const storeId = route.params.id
    await axios.delete(`/store/${storeId}`)
    // alert('刪除成功！')
    router.push('./show')
  } catch (error) {
    console.error('刪除失敗:', error)
    alert('刪除失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  Promise.all([fetchStore(), fetchMenus()])
})
</script>