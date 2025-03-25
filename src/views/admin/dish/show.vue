<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>餐點列表</h1>
      <router-link to="./add" class="btn btn-primary">
        新增餐點
      </router-link>
    </div>

    <!-- 菜單類別選擇 -->
    <div class="row mb-4">
      <div class="col">
        <div class="btn-group w-100" role="group">
          <input type="radio" class="btn-check" name="dishType" id="mainDish" v-model="currentView" value="main"
            checked>
          <label class="btn btn-outline-primary" for="mainDish">主餐</label>

          <input type="radio" class="btn-check" name="dishType" id="elseDish" v-model="currentView" value="else">
          <label class="btn btn-outline-primary" for="elseDish">附餐</label>

          <input type="radio" class="btn-check" name="dishType" id="addonDish" v-model="currentView" value="addon">
          <label class="btn btn-outline-primary" for="addonDish">食材加點</label>

          <input type="radio" class="btn-check" name="dishType" id="rawMeat" v-model="currentView" value="raw">
          <label class="btn btn-outline-primary" for="rawMeat">生肉切盤</label>
        </div>
      </div>
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
      <button @click="fetchDishes" class="btn btn-sm btn-outline-danger ms-2">重試</button>
    </div>

    <!-- 餐點卡片網格 -->
    <div v-else class="row row-cols-1 row-cols-md-3 g-4">
      <div v-for="dish in dishes" :key="dish._id" class="col">
        <div class="card h-100">
          <img v-if="dish.image?.url" :src="dish.image.url" :alt="dish.image.alt" class="card-img-top"
            style="height: 200px; object-fit: cover;">
          <div class="card-body">
            <h5 class="card-title">{{ dish.name }}</h5>
            <p class="card-text">${{ dish.price }}</p>
            <button class="btn btn-primary" @click="showDetails(dish)">查看詳情</button>
          </div>
        </div>
      </div>

      <!-- 無餐點提示 -->
      <div v-if="dishes.length === 0" class="col-12">
        <div class="text-center py-5 text-muted">
          <p>目前沒有餐點</p>
        </div>
      </div>
    </div>

    <!-- 詳情模態框 -->
    <div class="modal fade" id="dishModal" tabindex="-1" ref="modal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedDish?.name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedDish">
              <!-- 主餐詳情 -->
              <div v-if="currentView === 'main'">
                <p><strong>類別:</strong> {{ selectedDish.category === 'Steak' ? '牛排類' : '非牛排類' }}</p>
                <p><strong>價格:</strong> ${{ selectedDish.price }}</p>
                <p v-if="selectedDish.description"><strong>描述:</strong> {{
                  selectedDish.description }}</p>

                <div v-if="selectedDish.sauceOptions?.length">
                  <strong>醬料選項:</strong>
                  <ul>
                    <li v-for="sauce in selectedDish.sauceOptions" :key="sauce">{{ sauce }}</li>
                  </ul>
                </div>

                <div v-if="selectedDish.category == 'Steak' && selectedDish.steakDoneness?.length">
                  <strong>熟度選項:</strong>
                  <ul>
                    <li v-for="doneness in selectedDish.steakDoneness" :key="doneness">{{ doneness
                    }}</li>
                  </ul>
                </div>

                <div v-if="selectedDish.extraOptions?.length">
                  <strong>額外選項:</strong>
                  <ul>
                    <li v-for="option in selectedDish.extraOptions" :key="option">{{ option }}</li>
                  </ul>
                </div>

                <p v-if="selectedDish.extraPrice"><strong>加點價格:</strong> ${{
                  selectedDish.extraPrice }}</p>
              </div>

              <!-- 附餐詳情 -->
              <div v-if="currentView === 'else'">
                <p><strong>價格:</strong> ${{ selectedDish.price }}</p>
                <p v-if="selectedDish.description"><strong>描述:</strong> {{
                  selectedDish.description }}</p>
              </div>

              <!-- 加點詳情 -->
              <div v-if="currentView === 'addon'">
                <p><strong>價格:</strong> ${{ selectedDish.price }}</p>
              </div>

              <!-- 生肉詳情 -->
              <div v-if="currentView === 'raw'">
                <p><strong>價格:</strong> ${{ selectedDish.price }}</p>
                <p><strong>描述:</strong> {{ selectedDish.description }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" @click="editDish">編輯</button>
            <button type="button" class="btn btn-danger" @click="deleteDish">刪除</button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import { Modal } from 'bootstrap'

const router = useRouter()

// 狀態變數
const currentView = ref('main')
const dishes = ref([])
const selectedDish = ref(null)
const modal = ref(null)
const loading = ref(false)
const error = ref(null)

// 菜單類型對應端點
const endpoints = {
  main: 'mainDish',
  else: 'elseDish',
  addon: 'addon',
  raw: 'rawMeat'
}

// 獲取餐點列表
const fetchDishes = async () => {
  loading.value = true
  error.value = null // 清空錯誤訊息
  
  try {
    const response = await api.dish.getAll(endpoints[currentView.value])
    
    // 檢查 API 回應
    if (response.data.success) {
      dishes.value = response.data.dishes || []
    } else {
      error.value = response.data.message || '獲取餐點列表失敗'
    }
  } catch (err) {
    console.error('獲取餐點列表錯誤:', err)
    
    if (err.response) {
      // 伺服器有回應但狀態碼不是 2xx
      error.value = err.response.data.message || '獲取餐點列表失敗'
    } else if (err.request) {
      // 沒有收到伺服器的回應（可能是網路錯誤）
      error.value = '無法連線到伺服器'
    } else {
      // 其他錯誤
      error.value = '發生錯誤，請稍後再試'
    }
  } finally {
    loading.value = false
  }
}

// 顯示餐點詳情
const showDetails = (dish) => {
  selectedDish.value = dish
  if (modal.value) {
    new Modal(modal.value).show()
  }
}

// 編輯餐點
const editDish = () => {
  if (selectedDish.value) {
    router.push(`/admin/dish/${endpoints[currentView.value]}/${selectedDish.value._id}`)
  }
}

// 刪除餐點
const deleteDish = async () => {
  if (!selectedDish.value || !confirm('確定要刪除這個餐點嗎？')) {
    return
  }

  try {
    const response = await api.dish.delete(endpoints[currentView.value], selectedDish.value._id)
    
    // 檢查 API 回應
    if (response.data.success) {
      // 刪除成功，重新獲取餐點列表
      await fetchDishes()
      
      // 關閉模態框
      if (modal.value) {
        const modalInstance = Modal.getInstance(modal.value)
        if (modalInstance) {
          modalInstance.hide()
        }
      }
    } else {
      // API 回傳失敗
      alert(response.data.message || '刪除餐點失敗')
    }
  } catch (err) {
    console.error('刪除餐點錯誤:', err)
    
    if (err.response) {
      // 伺服器有回應但狀態碼不是 2xx
      alert(err.response.data.message || '刪除餐點失敗')
    } else if (err.request) {
      // 沒有收到伺服器的回應（可能是網路錯誤）
      alert('無法連線到伺服器')
    } else {
      // 其他錯誤
      alert('發生錯誤，請稍後再試')
    }
  }
}

// 監聽切換菜單類型
watch(currentView, fetchDishes)

// 初始加載
onMounted(() => {
  fetchDishes()
})

// 組件卸載前清理
onBeforeUnmount(() => {
  // 1. 先嘗試正常隱藏模態框
  if (modal.value) {
    const modalInstance = Modal.getInstance(modal.value)
    if (modalInstance) {
      modalInstance.hide()
    }
  }

  // 2. 強制清理背景遮罩
  const backdrop = document.querySelector('.modal-backdrop')
  if (backdrop) {
    backdrop.remove()
  }

  // 3. 重置 body 樣式
  document.body.classList.remove('modal-open')
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
})
</script>