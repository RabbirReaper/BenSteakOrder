<template>
  <div class="container py-4">
    <h1 class="mb-4">菜單編輯</h1>
    
    <!-- 菜單列表 -->
    <div class="mb-4">
      <div v-for="(category, categoryIndex) in menuData" :key="categoryIndex" class="card mb-3">
        <div class="card-body">
          <!-- 類別名稱 -->
          <div class="mb-3">
            <label class="form-label">類別名稱</label>
            <input 
              v-model="category.categoryName"
              type="text"
              class="form-control"
              placeholder="輸入類別名稱（例如：主餐、附餐）"
            />
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
        :disabled="!isValid"
      >
        儲存菜單
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

// 資料狀態
const menuData = ref([])
const mainDishes = ref([])
const elseDishes = ref([])
const rawMeats = ref([])

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

// 獲取指定類型的餐點
const fetchDishes = async (endpoint) => {
  try {
    const response = await axios.get(`/dish${endpoint}`)
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
      fetchDishes('/mainDish'),
      fetchDishes('/elseDish'),
      fetchDishes('/rawMeat')
    ])
    
    mainDishes.value = mainResponse
    elseDishes.value = elseResponse
    rawMeats.value = rawResponse
  } catch (error) {
    console.error('Error initializing dishes:', error)
  }
}

// 新增類別
const addCategory = () => {
  menuData.value.push({
    categoryName: '',
    items: []
  })
}

// 刪除類別
const removeCategory = (index) => {
  menuData.value.splice(index, 1)
}

// 新增餐點項目
const addItem = (category) => {
  category.items.push({
    itemModel: '',
    itemId: null,
    order: category.items.length
  })
}

// 刪除餐點項目
const removeItem = (categoryIndex, itemIndex) => {
  menuData.value[categoryIndex].items.splice(itemIndex, 1)
  updateOrder(categoryIndex)
}

// 移動項目
const moveItem = (categoryIndex, itemIndex, direction) => {
  const newIndex = itemIndex + direction
  const items = menuData.value[categoryIndex].items
  if (newIndex >= 0 && newIndex < items.length) {
    const temp = items[itemIndex]
    items[itemIndex] = items[newIndex]
    items[newIndex] = temp
    updateOrder(categoryIndex)
  }
}

// 更新排序
const updateOrder = (categoryIndex) => {
  menuData.value[categoryIndex].items.forEach((item, index) => {
    item.order = index
  })
}

// 驗證表單
const isValid = computed(() => {
  if(menuData.value.length === 0) {
    return false
  }
  return menuData.value.every(category => 
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
      list: menuData.value.map(category => ({
        categoryName: category.categoryName,
        items: category.items.map(({ itemModel, itemId, order }) => ({
          itemModel,
          itemId,
          order
        }))
      }))
    }
    
    await axios.post('/menu', menuToSave)
    alert('菜單儲存成功！')
  } catch (error) {
    console.error('Error saving menu:', error)
    alert('儲存失敗，請稍後再試')
  }
}

// 初始化
onMounted(() => {
  initializeDishes()
})
</script>