<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>菜單列表</h1>
      <router-link to="./add" class="btn btn-primary">
        新增菜單
      </router-link>
    </div>

    <!-- 讀取中提示 -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- 錯誤提示 -->
    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <!-- 菜單列表 -->
    <div v-else class="row g-4">
      <div v-for="menu in menus" :key="menu._id" class="col-12">
        <div class="card h-100 hover-shadow" style="cursor: pointer;" @click="goToEdit(menu._id)">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h5 class="card-title">{{ menu.name }}</h5>
                <p class="card-text text-muted">
                  {{ menu.list.length }} 個類別，
                  總計 {{ getTotalItems(menu) }} 個項目
                </p>

                <!-- 類別預覽 -->
                <div class="small text-muted">
                  類別：
                  <span v-for="(category, index) in menu.list" :key="index">
                    {{ category.categoryName }}{{ index < menu.list.length - 1 ? '、' : '' }} </span>
                </div>
              </div>

              <!-- 操作按鈕 -->
              <div class="btn-group">
                <button class="btn btn-outline-primary btn-sm" @click.stop="goToEdit(menu._id)">
                  編輯
                </button>
                <button 
                  class="btn btn-outline-danger btn-sm" 
                  @click.stop="confirmDelete(menu)"
                  :disabled="isDeleting === menu._id"
                >
                  <span v-if="isDeleting === menu._id" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  {{ isDeleting === menu._id ? '刪除中' : '刪除' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 無資料提示 -->
      <div v-if="menus.length === 0" class="col-12">
        <div class="text-center py-5 text-muted">
          <p>目前沒有菜單</p>
          <router-link to="./add" class="btn btn-primary">
            新增第一個菜單
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()
const menus = ref([])
const loading = ref(true)
const error = ref(null)
const isDeleting = ref(null) // 記錄目前正在刪除的菜單ID

// 獲取所有菜單
const fetchMenus = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await api.menu.getAll()
    
    if (response.data.success) {
      menus.value = response.data.menus || []
    } else {
      error.value = response.data.message || '獲取菜單列表失敗'
      console.error('API error:', response.data.message)
    }
  } catch (err) {
    console.error('Error fetching menus:', err)
    
    if (err.response) {
      // 伺服器有回應但狀態碼不是 2xx
      error.value = err.response.data.message || '伺服器回應錯誤'
    } else if (err.request) {
      // 沒有收到伺服器的回應（可能是網路錯誤）
      error.value = '無法連線到伺服器'
    } else {
      // 其他錯誤（例如程式錯誤）
      error.value = '獲取菜單列表失敗，請稍後再試'
    }
  } finally {
    loading.value = false
  }
}

// 計算總項目數
const getTotalItems = (menu) => {
  return menu.list.reduce((total, category) => {
    return total + (category.items ? category.items.length : 0)
  }, 0)
}

// 跳轉到編輯頁面
const goToEdit = (id) => {
  router.push(`./${id}`)
}

// 確認刪除
const confirmDelete = async (menu) => {
  if (confirm(`確定要刪除菜單 "${menu.name}" 嗎？`)) {
    try {
      isDeleting.value = menu._id // 設置正在刪除的菜單ID
      
      const response = await api.menu.delete(menu._id)
      
      if (response.data.success) {
        // 刪除成功，重新獲取列表
        await fetchMenus()
      } else {
        alert(response.data.message || '刪除失敗，請稍後再試')
        console.error('API error:', response.data.message)
      }
    } catch (err) {
      console.error('Error deleting menu:', err)
      
      let errorMessage = '刪除失敗，請稍後再試'
      
      if (err.response) {
        errorMessage = err.response.data.message || '伺服器回應錯誤'
      } else if (err.request) {
        errorMessage = '無法連線到伺服器'
      }
      
      alert(errorMessage)
    } finally {
      isDeleting.value = null // 無論成功或失敗，都清除刪除狀態
    }
  }
}

// 初始化
onMounted(() => {
  fetchMenus()
})
</script>

<style scoped>
.hover-shadow {
  transition: box-shadow 0.3s ease;
}

.hover-shadow:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}
</style>