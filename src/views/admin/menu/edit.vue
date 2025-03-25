<template>
  <div class="container py-4">
    <!-- 載入中提示 -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- 錯誤提示 -->
    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <template v-else>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>{{ isEditing ? '編輯菜單' : '菜單詳情' }}</h1>
        <div class="btn-group">
          <button 
            v-if="!isEditing" 
            @click="isEditing = true" 
            class="btn btn-primary"
          >
            編輯
          </button>
          <button 
            v-if="!isEditing" 
            @click="confirmDelete" 
            class="btn btn-danger"
          >
            刪除
          </button>
          <button 
            v-if="isEditing" 
            @click="cancelEdit" 
            class="btn btn-secondary"
          >
            取消
          </button>
        </div>
      </div>

      <!-- 菜單內容 -->
      <div>
        <!-- 菜單名稱 -->
        <div class="card mb-4">
          <div class="card-body">
            <label class="form-label">菜單名稱</label>
            <input 
              v-model="menuName"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': menuNameError }"
              placeholder="輸入菜單名稱"
              :disabled="!isEditing"
              @blur="validateMenuName"
            />
            <div class="invalid-feedback">{{ menuNameError }}</div>
          </div>
        </div>
        
        <!-- 菜單類別列表 -->
        <div class="mb-4">
          <div v-for="(category, categoryIndex) in menuData" :key="categoryIndex" class="card mb-3">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <!-- 類別名稱 -->
                <div class="flex-grow-1 me-3">
                  <label class="form-label">類別名稱</label>
                  <input 
                    v-model="category.categoryName"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': category.error }"
                    placeholder="輸入類別名稱（例如：主餐、附餐）"
                    :disabled="!isEditing"
                    @blur="validateCategory(categoryIndex)"
                  />
                  <div class="invalid-feedback">{{ category.error }}</div>
                </div>
                <!-- 類別排序控制 -->
                <div v-if="isEditing" class="btn-group">
                  <button 
                    @click="moveCategory(categoryIndex, -1)"
                    class="btn btn-outline-secondary"
                    :disabled="categoryIndex === 0"
                  >
                    ↑
                  </button>
                  <button 
                    @click="moveCategory(categoryIndex, 1)"
                    class="btn btn-outline-secondary"
                    :disabled="categoryIndex === menuData.length - 1"
                  >
                    ↓
                  </button>
                </div>
              </div>

              <!-- 餐點列表 -->
              <div class="mb-3">
                <h5 class="card-title">餐點項目</h5>
                <div class="list-group">
                  <div 
                    v-for="(item, itemIndex) in category.items" 
                    :key="itemIndex"
                    class="list-group-item"
                  >
                    <div class="row align-items-center">
                      <div class="col">
                        <select 
                          v-model="item.itemModel"
                          class="form-select mb-2"
                          :class="{ 'is-invalid': item.modelError }"
                          @change="handleModelChange(categoryIndex, itemIndex)"
                          :disabled="!isEditing"
                        >
                          <option value="">選擇餐點類型</option>
                          <option value="MainDish">主餐</option>
                          <option value="ElseDish">其他餐點</option>
                          <option value="RawMeat">食材</option>
                        </select>
                        <div class="invalid-feedback">{{ item.modelError }}</div>
                        
                        <select 
                          v-if="item.itemModel"
                          v-model="item.itemId"
                          class="form-select"
                          :class="{ 'is-invalid': item.idError }"
                          :disabled="!isEditing"
                          @blur="validateItemId(categoryIndex, itemIndex)"
                        >
                          <option value="">選擇餐點</option>
                          <option 
                            v-for="dish in getDishes(item.itemModel)" 
                            :key="dish._id" 
                            :value="dish._id"
                          >
                            {{ dish.name }} - ${{ dish.price }}
                          </option>
                        </select>
                        <div class="invalid-feedback">{{ item.idError }}</div>
                      </div>
                      <div v-if="isEditing" class="col-auto">
                        <div class="btn-group">
                          <button 
                            @click="moveItem(categoryIndex, itemIndex, -1)"
                            class="btn btn-outline-secondary"
                            :disabled="itemIndex === 0"
                          >
                            ↑
                          </button>
                          <button 
                            @click="moveItem(categoryIndex, itemIndex, 1)"
                            class="btn btn-outline-secondary"
                            :disabled="itemIndex === category.items.length - 1"
                          >
                            ↓
                          </button>
                          <button 
                            @click="removeItem(categoryIndex, itemIndex)"
                            class="btn btn-outline-danger"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  v-if="isEditing"
                  @click="addItem(category)"
                  class="btn btn-outline-primary mt-2"
                >
                  新增餐點
                </button>
              </div>

              <button 
                v-if="isEditing"
                @click="removeCategory(categoryIndex)"
                class="btn btn-danger"
              >
                刪除類別
              </button>
            </div>
          </div>
        </div>

        <!-- 提交錯誤訊息 -->
        <div v-if="submitError" class="alert alert-danger mb-3" role="alert">
          {{ submitError }}
        </div>

        <!-- 控制按鈕 -->
        <div v-if="isEditing" class="d-flex gap-2">
          <button 
            @click="addCategory"
            class="btn btn-primary"
          >
            新增類別
          </button>
          
          <button 
            @click="saveMenu"
            class="btn btn-success"
            :disabled="!isValid || isSubmitting"
          >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ isSubmitting ? '儲存中...' : '儲存菜單' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

const route = useRoute()
const router = useRouter()
const menuId = route.params.id

// 狀態
const loading = ref(true)
const error = ref(null)
const submitError = ref('') // 提交錯誤訊息
const isSubmitting = ref(false) // 提交狀態
const isEditing = ref(false)
const menuName = ref('')
const menuNameError = ref('')
const menuData = ref([])
const mainDishes = ref([])
const elseDishes = ref([])
const rawMeats = ref([])

// 從伺服器獲取菜單數據
const fetchMenu = async () => {
  try {
    loading.value = true
    error.value = null
    submitError.value = '' // 清空提交錯誤訊息
    
    const response = await api.menu.getById(menuId);
    
    if (response.data.success) {
      const menu = response.data.menu
      
      menuName.value = menu.name
      
      // 添加錯誤屬性到每個類別和項目
      menuData.value = menu.list.map(category => ({
        ...category,
        error: '',
        items: category.items.map(item => ({
          ...item,
          modelError: '',
          idError: ''
        }))
      }))
    } else {
      error.value = response.data.message || '獲取菜單數據失敗'
    }
  } catch (err) {
    console.error('Error fetching menu:', err)
    
    if (err.response) {
      error.value = err.response.data.message || '伺服器回應錯誤'
    } else if (err.request) {
      error.value = '無法連線到伺服器'
    } else {
      error.value = '獲取菜單數據失敗，請稍後再試'
    }
  } finally {
    loading.value = false
  }
}

// 獲取指定類型的餐點
const fetchDishes = async (endpoint) => {
  try {
    const response = await api.dish.getAll(endpoint)
    
    if (response.data.success) {
      return response.data.dishes
    } else {
      console.error('Error in API response:', response.data.message)
      return []
    }
  } catch (error) {
    console.error('Error fetching dishes:', error)
    
    if (!err.value) { // 只有在頁面主錯誤未設置時才設置
      err.value = '無法獲取餐點數據'
    }
    
    return []
  }
}

// 初始化時獲取所有類型的餐點
const initializeDishes = async () => {
  try {
    const [mainDishesData, elseDishesData, rawMeatsData] = await Promise.all([
      fetchDishes('mainDish'),
      fetchDishes('elseDish'),
      fetchDishes('rawMeat')
    ])
    
    mainDishes.value = mainDishesData
    elseDishes.value = elseDishesData
    rawMeats.value = rawMeatsData
  } catch (err) {
    console.error('Error initializing dishes:', err)
    
    if (!error.value) { // 只有在頁面主錯誤未設置時才設置
      error.value = '初始化餐點數據失敗'
    }
  }
}

// 根據餐點類型獲取對應的餐點列表
const getDishes = (itemModel) => {
  switch (itemModel) {
    case 'MainDish':
      return mainDishes.value || []
    case 'ElseDish':
      return elseDishes.value || []
    case 'RawMeat':
      return rawMeats.value || []
    default:
      return []
  }
}

// 驗證菜單名稱
const validateMenuName = () => {
  if (!menuName.value.trim()) {
    menuNameError.value = '請輸入菜單名稱'
    return false
  }
  menuNameError.value = ''
  return true
}

// 驗證類別名稱
const validateCategory = (categoryIndex) => {
  const category = menuData.value[categoryIndex]
  if (!category.categoryName.trim()) {
    category.error = '請輸入類別名稱'
    return false
  }
  category.error = ''
  return true
}

// 處理模型變更時重置餐點ID
const handleModelChange = (categoryIndex, itemIndex) => {
  const item = menuData.value[categoryIndex].items[itemIndex]
  item.itemId = null
  item.modelError = item.itemModel ? '' : '請選擇餐點類型'
}

// 驗證餐點ID
const validateItemId = (categoryIndex, itemIndex) => {
  const item = menuData.value[categoryIndex].items[itemIndex]
  if (!item.itemId) {
    item.idError = '請選擇餐點'
    return false
  }
  item.idError = ''
  return true
}

// 類別操作
const addCategory = () => {
  menuData.value.push({
    categoryName: '',
    error: '',
    items: [],
    order: menuData.value.length
  })
}

const removeCategory = (index) => {
  menuData.value.splice(index, 1)
  updateCategoryOrders()
}

const moveCategory = (categoryIndex, direction) => {
  const newIndex = categoryIndex + direction
  if (newIndex >= 0 && newIndex < menuData.value.length) {
    const temp = menuData.value[categoryIndex]
    menuData.value[categoryIndex] = menuData.value[newIndex]
    menuData.value[newIndex] = temp
    updateCategoryOrders()
  }
}

// 項目操作
const addItem = (category) => {
  category.items.push({
    itemModel: '',
    itemId: null,
    modelError: '',
    idError: '',
    order: category.items.length
  })
}

const removeItem = (categoryIndex, itemIndex) => {
  menuData.value[categoryIndex].items.splice(itemIndex, 1)
  updateItemOrders(categoryIndex)
}

const moveItem = (categoryIndex, itemIndex, direction) => {
  const newIndex = itemIndex + direction
  const items = menuData.value[categoryIndex].items
  if (newIndex >= 0 && newIndex < items.length) {
    const temp = items[itemIndex]
    items[itemIndex] = items[newIndex]
    items[newIndex] = temp
    updateItemOrders(categoryIndex)
  }
}

// 更新排序
const updateCategoryOrders = () => {
  menuData.value.forEach((category, index) => {
    category.order = index
  })
}

const updateItemOrders = (categoryIndex) => {
  menuData.value[categoryIndex].items.forEach((item, index) => {
    item.order = index
  })
}

// 驗證整個表單
const validateForm = () => {
  let isValid = true
  
  // 驗證菜單名稱
  if (!validateMenuName()) {
    isValid = false
  }
  
  // 驗證每個類別
  menuData.value.forEach((category, categoryIndex) => {
    if (!validateCategory(categoryIndex)) {
      isValid = false
    }
    
    // 驗證每個餐點項目
    category.items.forEach((item, itemIndex) => {
      if (!item.itemModel) {
        item.modelError = '請選擇餐點類型'
        isValid = false
      }
      
      if (!item.itemId) {
        item.idError = '請選擇餐點'
        isValid = false
      }
    })
  })
  
  return isValid
}

// 表單有效性計算屬性
const isValid = computed(() => {
  return menuName.value.trim() !== '' && 
    menuData.value.length > 0 &&
    menuData.value.every(category => 
      category.categoryName.trim() !== '' &&
      category.items.length > 0 &&
      category.items.every(item => 
        item.itemModel && item.itemId
      )
    )
})

// 儲存菜單
const saveMenu = async () => {
  // 驗證表單
  if (!validateForm()) {
    return
  }
  
  submitError.value = '' // 先清空錯誤訊息
  isSubmitting.value = true // 設置提交狀態為 true
  
  try {
    const menuToSave = {
      name: menuName.value,
      list: menuData.value.map((category, categoryIndex) => ({
        categoryName: category.categoryName,
        order: categoryIndex,
        items: category.items.map((item, itemIndex) => ({
          itemModel: item.itemModel,
          itemId: item.itemId,
          order: itemIndex
        }))
      }))
    }
    
    const response = await api.menu.update(menuId, menuToSave);
    
    if (response.data.success) {
      alert('菜單更新成功！')
      isEditing.value = false
    } else {
      submitError.value = response.data.message || '儲存失敗，請稍後再試'
    }
  } catch (err) {
    console.error('Error saving menu:', err)
    
    if (err.response) {
      // 伺服器有回應但狀態碼不是 2xx
      submitError.value = err.response.data.message || '伺服器回應錯誤';
    } else if (err.request) {
      // 沒有收到伺服器的回應（可能是網路錯誤）
      submitError.value = '無法連線到伺服器';
    } else {
      // 其他錯誤（例如程式錯誤）
      submitError.value = '發生錯誤，請稍後再試';
    }
  } finally {
    isSubmitting.value = false // 無論成功或失敗，都將提交狀態設回 false
  }
}

// 取消編輯
const cancelEdit = async () => {
  isEditing.value = false
  submitError.value = '' // 清空提交錯誤訊息
  await fetchMenu() // 重新獲取數據，恢復原始狀態
}

// 確認刪除
const confirmDelete = async () => {
  if (confirm(`確定要刪除菜單 "${menuName.value}" 嗎？`)) {
    try {
      isSubmitting.value = true
      const response = await api.menu.delete(menuId);
      
      if (response.data.success) {
        alert('菜單刪除成功！')
        router.push('/admin/menu/show')
      } else {
        error.value = response.data.message || '刪除失敗，請稍後再試'
      }
    } catch (err) {
      console.error('Error deleting menu:', err)
      
      if (err.response) {
        error.value = err.response.data.message || '伺服器回應錯誤';
      } else if (err.request) {
        error.value = '無法連線到伺服器';
      } else {
        error.value = '刪除失敗，請稍後再試';
      }
    } finally {
      isSubmitting.value = false
    }
  }
}

// 初始化
onMounted(async () => {
  await Promise.all([
    fetchMenu(),
    initializeDishes()
  ])
})
</script>