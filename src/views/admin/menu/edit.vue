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
              placeholder="輸入菜單名稱"
              :disabled="!isEditing"
            />
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
                    placeholder="輸入類別名稱（例如：主餐、附餐）"
                    :disabled="!isEditing"
                  />
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
                          @change="item.itemId = null"
                          :disabled="!isEditing"
                        >
                          <option value="">選擇餐點類型</option>
                          <option value="MainDish">主餐</option>
                          <option value="ElseDish">其他餐點</option>
                          <option value="RawMeat">食材</option>
                        </select>
                        
                        <select 
                          v-if="item.itemModel"
                          v-model="item.itemId"
                          class="form-select"
                          :disabled="!isEditing"
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
            :disabled="!isValid"
          >
            儲存菜單
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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const menuId = route.params.id

// 狀態
const loading = ref(true)
const error = ref(null)
const isEditing = ref(false)
const menuName = ref('')
const menuData = ref([])
const mainDishes = ref([])
const elseDishes = ref([])
const rawMeats = ref([])

// 從伺服器獲取菜單數據
const fetchMenu = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await api.menu.getById(menuId);
    const menu = response.data
    
    menuName.value = menu.name
    menuData.value = menu.list
  } catch (err) {
    error.value = '獲取菜單數據失敗，請稍後再試'
    console.error('Error fetching menu:', err)
  } finally {
    loading.value = false
  }
}

// 獲取指定類型的餐點
const fetchDishes = async (endpoint) => {
  try {
    const response = await api.dish.getAll(endpoint);
    return response.data
  } catch (error) {
    console.error('Error fetching dishes:', error)
    return []
  }
}

// 初始化時獲取所有類型的餐點
const initializeDishes = async () => {
  try {
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
  }
}

// 根據餐點類型獲取對應的餐點列表
const getDishes = (itemModel) => {
  switch (itemModel) {
    case 'MainDish':
      return mainDishes.value
    case 'ElseDish':
      return elseDishes.value
    case 'RawMeat':
      return rawMeats.value
    default:
      return []
  }
}

// 類別操作
const addCategory = () => {
  menuData.value.push({
    categoryName: '',
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

// 表單驗證
const isValid = computed(() => {
  return menuName.value.trim() !== '' && 
    menuData.value.every(category => 
      category.categoryName.trim() !== '' &&
      category.items.every(item => 
        item.itemModel && item.itemId
      )
    )
})

// 儲存菜單
const saveMenu = async () => {
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
    
    await api.menu.update(menuId, menuToSave);
    alert('菜單更新成功！')
    isEditing.value = false
  } catch (error) {
    console.error('Error saving menu:', error)
    alert('儲存失敗，請稍後再試')
  }
}

// 取消編輯
const cancelEdit = async () => {
  isEditing.value = false
  await fetchMenu() // 重新獲取數據，恢復原始狀態
}

// 確認刪除
const confirmDelete = async () => {
  if (confirm(`確定要刪除菜單 "${menuName.value}" 嗎？`)) {
    try {
      await api.menu.delete(menuId);
      router.push('/menu') // 刪除後返回列表頁
    } catch (err) {
      alert('刪除失敗，請稍後再試')
      console.error('Error deleting menu:', err)
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