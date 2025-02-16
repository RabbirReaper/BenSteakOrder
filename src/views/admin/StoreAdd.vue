<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h2 class="mb-0">新增店家</h2>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleSubmit">
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
import { useRouter } from 'vue-router'

const router = useRouter()
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

const handleSubmit = async () => {
  try {
    loading.value = true
    await axios.post('/store', storeForm.value)
    // alert('新增成功！')
    router.push('./show')
  } catch (error) {
    console.error('新增失敗:', error)
    alert('新增失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMenus()
})
</script>