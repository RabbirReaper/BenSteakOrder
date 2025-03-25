<template>
  <div class="container-fluid p-0">
    <div class="component-header bg-primary text-white p-3">
      <h4>內用點餐</h4>
    </div>

    <!-- 加載提示 -->
    <div v-if="isLoading" class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <span class="ms-2">載入菜單資料中...</span>
    </div>

    <!-- 錯誤提示 -->
    <div v-if="errorMessage" class="alert alert-danger m-3" role="alert">
      {{ errorMessage }}
      <button class="btn btn-outline-danger btn-sm ms-2" @click="fetchMenuData">重試</button>
    </div>

    <div v-if="!isLoading && !errorMessage" class="row g-0">
      <!-- 上半部：菜單選擇區域 -->
      <div class="col-12 menu-section p-3">
        <!-- 合併的菜單列表 -->
        <div class="menu-items-grid">
          <!-- 主餐列表 -->
          <div v-for="dish in orderStore.menuData.mainDishes" :key="dish._id" class="menu-item-card"
            @click="selectDish(dish, 'MainDish')">
            <div class="card h-100">
              <div class="card-body"
                :class="{ 'selected': orderStore.currentItem?.id === dish._id && orderStore.currentItem?.itemModel === 'MainDish' }">
                <h6 class="fs-5 card-title">{{ dish.name }}</h6>
                <p class="card-text price">${{ dish.price }}</p>
              </div>
            </div>
          </div>

          <!-- 附餐列表 -->
          <div v-for="dish in orderStore.menuData.elseDishes" :key="dish._id" class="menu-item-card"
            @click="selectDish(dish, 'ElseDish')">
            <div class="card h-100">
              <div class="card-body"
                :class="{ 'selected': orderStore.currentItem?.id === dish._id && orderStore.currentItem?.itemModel === 'ElseDish' }">
                <h6 class="card-title fs-5">{{ dish.name }}</h6>
                <p class="card-text price">${{ dish.price }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 下半部：選項設定區域 -->
      <div class="col-12 options-section bg-light p-3" v-if="selectedDish">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5>{{ selectedDish.name }} - 選項設定</h5>
          <div class="d-flex align-items-center">
            <span class="text-danger fs-5 me-2">${{ orderStore.currentItem?.price }}</span>
            <button class="btn btn-secondary btn-sm" @click="cancelSelection">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>

        <!-- 主餐特定選項 -->
        <div v-if="selectedDishType === 'MainDish'" class="mb-3">
          <!-- 熟度選擇 (只適用於牛排類) - 改為按鈕 -->
          <div class="mb-4 doneness-section" v-if="selectedDish.category === 'Steak' && selectedDish.steakDoneness">
            <div class="row g-2">
              <div v-for="doneness in selectedDish.steakDoneness" :key="doneness" class="col-4 col-md-2">
                <div class="card p-2 text-center doneness-card"
                  :class="{ 'selected': orderStore.currentItem?.doneness === doneness }"
                  @click="orderStore.selectDoneness(doneness)">
                  <div class="card-body p-1">
                    <p class="fs-5 fw-bold mb-0">{{ doneness }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 醬料選擇 - 改為按鈕 -->
          <div class="mb-4 sauce-section" v-if="selectedDish.sauceOptions && selectedDish.sauceOptions.length">
            <div class="row g-2">
              <div v-for="sauce in selectedDish.sauceOptions" :key="sauce" class="col-4 col-md-2">
                <div class="card p-2 text-center sauce-card"
                  :class="{ 'selected': orderStore.currentItem?.sauce === sauce }"
                  @click="orderStore.selectSauce(sauce)">
                  <div class="card-body p-1">
                    <p class="fs-5 fw-bold mb-0">{{ sauce }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 額外需求 - 改為按鈕 -->
          <div class="mb-4 extra-section" v-if="selectedDish.extraOptions && selectedDish.extraOptions.length">
            <div class="row g-2">
              <div v-for="option in selectedDish.extraOptions" :key="option" class="col-4 col-md-2">
                <div class="card p-2 text-center extra-option-card"
                  :class="{ 'selected': orderStore.isExtraOptionSelected(option) }"
                  @click="orderStore.toggleExtraOption(option)">
                  <div class="card-body p-1">
                    <p class="fs-5 fw-bold mb-0">{{ option }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 加點配料 -->
          <div class="mb-4 addon-section">
            <div class="row g-2">
              <div v-for="addon in orderStore.menuData.addons" :key="addon._id" class="col-4 col-md-2">
                <div class="card p-2 text-center addon-card" :class="{ 'selected': orderStore.isAddonSelected(addon) }"
                  @click="orderStore.toggleAddon(addon)">
                  <div class="card-body p-1">
                    <p class="fs-5 fw-bold mb-0">{{ addon.name }}</p>
                    <small class="fs-6">${{ addon.price }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 加點其他肉類單品 -->
          <div class="mb-4 meat-section" v-if="orderStore.additionalMeatDishes.length > 0">
            <div class="row g-2">
              <div v-for="meat in orderStore.additionalMeatDishes" :key="meat._id" class="col-4 col-md-2">
                <div class="card p-2 text-center meat-card"
                  :class="{ 'selected': orderStore.isAdditionalMeatSelected(meat) }"
                  @click="orderStore.toggleAdditionalMeat(meat)">
                  <div class="card-body p-1">
                    <p class="fs-5 fw-bold mb-0">{{ meat.name }}</p>
                    <small class="fs-6">${{ meat.extraPrice }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useOrderStore } from '@/stores/order';
import api from '@/api';

const props = defineProps({
  storeId: {
    type: String,
    required: true
  }
});

// 使用 Pinia store
const orderStore = useOrderStore();

// 內部狀態
const selectedDish = ref(null);
const selectedDishType = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');

// 加載菜單數據
const fetchMenuData = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    // 獲取店家資訊（包括菜單）
    const storeResponse = await api.store.getById(props.storeId);
    
    if (!storeResponse.data.success) {
      throw new Error(storeResponse.data.message || '獲取店家資訊失敗');
    }
    
    const store = storeResponse.data.store;
    
    // 獲取菜單細節
    const menuResponse = await api.menu.getById(store.menuItem);
    
    if (!menuResponse.data.success) {
      throw new Error(menuResponse.data.message || '獲取菜單資訊失敗');
    }
    
    // 初始化菜單數據
    orderStore.initMenuData(menuResponse.data.menu, store);
    
    // 加載餐點詳細資料
    await loadDishDetails();
    
  } catch (error) {
    console.error('獲取菜單數據錯誤:', error);
    
    if (error.response) {
      // 伺服器回應錯誤
      errorMessage.value = error.response.data.message || '獲取菜單時發生錯誤';
    } else if (error.request) {
      // 沒有收到伺服器回應
      errorMessage.value = '無法連線到伺服器，請檢查網絡連接';
    } else {
      // 其他錯誤
      errorMessage.value = error.message || '發生未知錯誤';
    }
  } finally {
    isLoading.value = false;
  }
};

// 加載餐點詳細資料
const loadDishDetails = async () => {
  try {
    // 加載主餐資料
    const mainDishesPromise = api.dish.getAll('mainDish');
    // 加載附餐資料
    const elseDishesPromise = api.dish.getAll('elseDish');
    // 加載配料資料
    const addonsPromise = api.dish.getAll('addon');
    // 加載生肉資料
    const rawMeatPromise = api.dish.getAll('rawMeat');
    
    // 平行處理所有請求
    const [mainDishesRes, elseDishesRes, addonsRes, rawMeatRes] = await Promise.all([
      mainDishesPromise,
      elseDishesPromise,
      addonsPromise,
      rawMeatPromise
    ]);
    
    // 檢查回應是否成功
    if (!mainDishesRes.data.success || !elseDishesRes.data.success || 
        !addonsRes.data.success || !rawMeatRes.data.success) {
      throw new Error('獲取餐點詳細資料失敗');
    }
    
    // 更新 store 中的餐點詳細資料
    orderStore.setDishesData({
      mainDishes: mainDishesRes.data.dishes,
      elseDishes: elseDishesRes.data.dishes,
      addons: addonsRes.data.dishes,
      rawMeat: rawMeatRes.data.dishes
    });
    
  } catch (error) {
    console.error('加載餐點詳細資料錯誤:', error);
    throw error; // 將錯誤傳遞給上層函數
  }
};

// 選擇菜品 - 直接添加到購物車
const selectDish = (dish, type) => {
  try {
    // 將菜品添加到購物車
    orderStore.addDishToCart(dish, type);

    // 設置選中的菜品用於顯示選項
    selectedDish.value = dish;
    selectedDishType.value = type;
  } catch (error) {
    console.error('選擇菜品時發生錯誤:', error);
    errorMessage.value = '無法選擇此菜品，請稍後再試';
  }
};

// 取消選擇
const cancelSelection = () => {
  resetSelection();
};

// 重置選擇
const resetSelection = () => {
  selectedDish.value = null;
  selectedDishType.value = null;
  orderStore.clearCurrentItem();
};

// 監聽 store 中的當前項目變化
watch(() => orderStore.currentItem, (newItem) => {
  if (newItem && orderStore.currentItemIndex !== null) {
    // 如果是從購物車編輯，根據當前項目更新選中的菜品
    const dishType = newItem.itemModel;
    let dish;

    if (dishType === 'MainDish') {
      dish = orderStore.menuData.mainDishes.find(d => d._id === newItem.id);
    } else if (dishType === 'ElseDish') {
      dish = orderStore.menuData.elseDishes.find(d => d._id === newItem.id);
    }

    if (dish) {
      selectedDish.value = dish;
      selectedDishType.value = dishType;
    }
  } else if (!newItem) {
    // 當 currentItem 被清空時，也清空本地狀態
    selectedDish.value = null;
    selectedDishType.value = null;
  }
}, { immediate: true });

// 組件掛載時加載菜單數據
onMounted(() => {
  fetchMenuData();
});
</script>

<style scoped>
.component-header {
  position: sticky;
  top: 0;
  z-index: 100;
}

.menu-section {
  height: 40vh;
  overflow-y: auto;
  border-bottom: 1px solid #dee2e6;
}

.options-section {
  height: calc(60vh - 56px);
  overflow-y: auto;
}

.menu-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.menu-item-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.menu-item-card:hover {
  transform: translateY(-3px);
}

.price {
  color: #dc3545;
  font-weight: bold;
}

.doneness-card,
.sauce-card,
.extra-option-card,
.addon-card,
.meat-card {
  cursor: pointer;
  transition: all 0.2s;
  height: 100%;
  font-size: 0.85rem;
  border-width: 2px;
}

.card-body {
  padding: 0.5rem !important;
}

.doneness-card:hover,
.sauce-card:hover,
.extra-option-card:hover,
.addon-card:hover,
.meat-card:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.doneness-card.selected {
  background-color: #ffebee;
  border-color: #dc3545;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.sauce-card.selected {
  background-color: #e8f5e9;
  border-color: #28a745;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.extra-option-card.selected {
  background-color: #e3f2fd;
  border-color: #17a2b8;
  box-shadow: 0 2px 8px rgba(23, 162, 184, 0.3);
}

.addon-card.selected {
  background-color: #fff8e1;
  border-color: #ffc107;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
}

.meat-card.selected {
  background-color: #eceff1;
  border-color: #6c757d;
  box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
}

.card-body.selected {
  background-color: #fff8e8;
  border: 2px solid #e22e0a;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(255, 1, 1, 0.2);
}


.doneness-section {
  border-left: 6px solid #dc3545;
  padding-left: 10px;
}

.sauce-section {
  border-left: 6px solid #28a745;
  padding-left: 10px;
}

.extra-section {
  border-left: 6px solid #17a2b8;
  padding-left: 10px;
}

.addon-section {
  border-left: 6px solid #ffc107;
  padding-left: 10px;
}

.meat-section {
  border-left: 6px solid #6c757d;
  padding-left: 10px;
}
</style>