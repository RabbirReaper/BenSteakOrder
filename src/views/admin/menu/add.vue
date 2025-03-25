<template>
  <div class="container py-4">
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
                @blur="validateCategory(categoryIndex)"
              />
              <div class="invalid-feedback">{{ category.error }}</div>
            </div>
            <!-- 類別排序控制 -->
            <div class="btn-group">
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
                  <div class="col-auto">
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
              @click="addItem(category)"
              class="btn btn-outline-primary mt-2"
            >
              新增餐點
            </button>
          </div>

          <button 
            @click="removeCategory(categoryIndex)"
            class="btn btn-danger"
          >
            刪除類別
          </button>
        </div>
      </div>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="errorMessage" class="alert alert-danger mb-3" role="alert">
      {{ errorMessage }}
    </div>

    <!-- 控制按鈕 -->
    <div class="d-flex gap-2">
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api'
import { useRouter } from 'vue-router'

const router = useRouter()

// 資料狀態
const menuName = ref('')
const menuNameError = ref('')
const menuData = ref([])
const mainDishes = ref([])
const elseDishes = ref([])
const rawMeats = ref([])
const errorMessage = ref('') // 全域錯誤訊息
const isSubmitting = ref(false) // 提交狀態

// 根據餐點類型獲取對應的餐點列表
const getDishes = (itemModel) => {
  switch (itemModel) {
    case 'MainDish':
      return mainDishes.value?.dishes || []
    case 'ElseDish':
      return elseDishes.value?.dishes || []
    case 'RawMeat':
      return rawMeats.value?.dishes || []
    default:
      return []
  }
}

// 獲取指定類型的餐點
const fetchDishes = async (endpoint) => {
  try {
    const response = await api.dish.getAll(endpoint);
    if (response.data.success) {
      return response.data
    } else {
      console.error('Error in API response:', response.data.message)
      return { dishes: [] }
    }
  } catch (error) {
    console.error('Error fetching dishes:', error)
    errorMessage.value = '獲取餐點資料失敗，請刷新頁面重試'
    return { dishes: [] }
  }
}

// 初始化時獲取所有類型的餐點
const initializeDishes = async () => {
  try {
    errorMessage.value = '' // 清空錯誤訊息
    const [mainResponse, elseResponse, rawResponse] = await Promise.all([
      fetchDishes('mainDish'),
      fetchDishes('elseDish'),
      fetchDishes('rawMeat')
    ])
    
    mainDishes.value = mainResponse
    elseDishes.value = elseResponse
    rawMeats.value = rawResponse
  } catch (error) {
    console.error('Error initializing dishes:', error)
    errorMessage.value = '初始化資料失敗，請重新載入頁面'
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

// 新增類別
const addCategory = () => {
  menuData.value.push({
    categoryName: '',
    error: '',
    items: [],
    order: menuData.value.length
  })
}

// 刪除類別
const removeCategory = (index) => {
  menuData.value.splice(index, 1)
  updateCategoryOrders()
}

// 新增餐點項目
const addItem = (category) => {
  category.items.push({
    itemModel: '',
    itemId: null,
    modelError: '',
    idError: '',
    order: category.items.length
  })
}

// 刪除餐點項目
const removeItem = (categoryIndex, itemIndex) => {
  menuData.value[categoryIndex].items.splice(itemIndex, 1)
  updateItemOrders(categoryIndex)
}

// 移動類別
const moveCategory = (categoryIndex, direction) => {
  const newIndex = categoryIndex + direction
  if (newIndex >= 0 && newIndex < menuData.value.length) {
    const temp = menuData.value[categoryIndex]
    menuData.value[categoryIndex] = menuData.value[newIndex]
    menuData.value[newIndex] = temp
    updateCategoryOrders()
  }
}

// 移動項目
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

// 更新類別順序
const updateCategoryOrders = () => {
  menuData.value.forEach((category, index) => {
    category.order = index
  })
}

// 更新項目順序
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
  
  errorMessage.value = '' // 先清空錯誤訊息
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
    
    const response = await api.menu.create(menuToSave);
    
    if (response.data.success) {
      alert('菜單儲存成功！')
      router.push('./show')
    } else {
      errorMessage.value = response.data.message || '儲存失敗，請稍後再試'
    }
  } catch (error) {
    console.error('Error saving menu:', error)
    
    if (error.response) {
      // 伺服器有回應但狀態碼不是 2xx
      errorMessage.value = error.response.data.message || '伺服器回應錯誤';
    } else if (error.request) {
      // 沒有收到伺服器的回應（可能是網路錯誤）
      errorMessage.value = '無法連線到伺服器';
    } else {
      // 其他錯誤（例如程式錯誤）
      errorMessage.value = '發生錯誤，請稍後再試';
    }
  } finally {
    isSubmitting.value = false // 無論成功或失敗，都將提交狀態設回 false
  }
}

// 初始化
onMounted(() => {
  initializeDishes()
})
</script>