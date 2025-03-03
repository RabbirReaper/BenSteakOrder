<template>
  <div class="container-fluid p-0">
    <div class="component-header bg-success text-white p-3">
      <h4>外帶點餐</h4>
    </div>
    
    <div class="row g-0">
      <!-- 上半部：菜單選擇區域 -->
      <div class="col-12 menu-section p-3">
        <!-- 合併的菜單列表 -->
        <div class="menu-items-grid">
          <!-- 主餐列表 -->
          <div 
            v-for="dish in orderStore.menuData.mainDishes" 
            :key="dish._id" 
            class="menu-item-card" 
            @click="selectDish(dish, 'MainDish')"
          >
            <div class="card h-100">
              <div class="card-body">
                <h6 class="card-title">{{ dish.name }}</h6>
                <p class="card-text price">${{ dish.price }}</p>
              </div>
            </div>
          </div>
          
          <!-- 附餐列表 -->
          <div 
            v-for="dish in orderStore.menuData.elseDishes" 
            :key="dish._id" 
            class="menu-item-card" 
            @click="selectDish(dish, 'ElseDish')"
          >
            <div class="card h-100">
              <div class="card-body">
                <h6 class="card-title">{{ dish.name }}</h6>
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
          <div class="mb-3" v-if="selectedDish.category === 'Steak' && selectedDish.steakDoneness">
            <div class="row g-2">
              <div 
                v-for="doneness in selectedDish.steakDoneness" 
                :key="doneness" 
                class="col-4 col-md-2"
              >
                <div 
                  class="card p-2 text-center doneness-card" 
                  :class="{ 'selected': orderStore.currentItem?.doneness === doneness }"
                  @click="orderStore.selectDoneness(doneness)"
                >
                  <div class="card-body p-1">
                    <p class="mb-0">{{ doneness }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 醬料選擇 - 改為按鈕 -->
          <div class="mb-3" v-if="selectedDish.sauceOptions && selectedDish.sauceOptions.length">
            <div class="row g-2">
              <div 
                v-for="sauce in selectedDish.sauceOptions" 
                :key="sauce" 
                class="col-4 col-md-2"
              >
                <div 
                  class="card p-2 text-center sauce-card" 
                  :class="{ 'selected': orderStore.currentItem?.sauce === sauce }"
                  @click="orderStore.selectSauce(sauce)"
                >
                  <div class="card-body p-1">
                    <p class="mb-0">{{ sauce }}</p>
                  </div>
                </div>
              </div>
              <div class="col-4 col-md-2">
                <div 
                  class="card p-2 text-center sauce-card" 
                  :class="{ 'selected': orderStore.currentItem?.sauce === '不加醬' }"
                  @click="orderStore.selectSauce('不加醬')"
                >
                  <div class="card-body p-1">
                    <p class="mb-0">不加醬</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 額外需求 - 改為按鈕 -->
          <div class="mb-3" v-if="selectedDish.extraOptions && selectedDish.extraOptions.length">
            <div class="row g-2">
              <div 
                v-for="option in selectedDish.extraOptions" 
                :key="option" 
                class="col-4 col-md-2"
              >
                <div 
                  class="card p-2 text-center extra-option-card" 
                  :class="{ 'selected': orderStore.isExtraOptionSelected(option) }"
                  @click="orderStore.toggleExtraOption(option)"
                >
                  <div class="card-body p-1">
                    <p class="mb-0">{{ option }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 加點配料 -->
          <div class="mb-3">
            <div class="row g-2">
              <div 
                v-for="addon in orderStore.menuData.addons" 
                :key="addon._id" 
                class="col-4 col-md-2"
              >
                <div 
                  class="card p-2 text-center addon-card" 
                  :class="{ 'selected': orderStore.isAddonSelected(addon) }"
                  @click="orderStore.toggleAddon(addon)"
                >
                  <div class="card-body p-1">
                    <p class="mb-0">{{ addon.name }}</p>
                    <small>${{ addon.price }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 加點其他肉類單品 -->
          <div class="mb-3" v-if="orderStore.additionalMeatDishes.length > 0">
            <div class="row g-2">
              <div 
                v-for="meat in orderStore.additionalMeatDishes" 
                :key="meat._id" 
                class="col-4 col-md-2"
              >
                <div 
                  class="card p-2 text-center meat-card" 
                  :class="{ 'selected': orderStore.isAdditionalMeatSelected(meat) }"
                  @click="orderStore.toggleAdditionalMeat(meat)"
                >
                  <div class="card-body p-1">
                    <p class="mb-0">{{ meat.name }}</p>
                    <small>${{ meat.extraPrice }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 外帶特殊選項 -->
        <div class="takeout-options mb-3">
          <h6>外帶選項</h6>
          <div class="row g-2">
            <div class="col-6 col-md-2">
              <div 
                class="card p-2 text-center takeout-option-card" 
                :class="{ 'selected': takeoutOptions.separatePackaging }"
                @click="toggleTakeoutOption('separatePackaging')"
              >
                <div class="card-body p-1">
                  <p class="mb-0">分開包裝</p>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-2">
              <div 
                class="card p-2 text-center takeout-option-card" 
                :class="{ 'selected': takeoutOptions.noUtensils }"
                @click="toggleTakeoutOption('noUtensils')"
              >
                <div class="card-body p-1">
                  <p class="mb-0">不需餐具</p>
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
import { ref, watch } from 'vue';
import { useOrderStore } from '@/stores/order';

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
const takeoutOptions = ref({
  separatePackaging: false,
  noUtensils: false
});

// 選擇菜品 - 直接添加到購物車
const selectDish = (dish, type) => {
  // 將菜品添加到購物車
  orderStore.addDishToCart(dish, type);
  
  // 設置選中的菜品用於顯示選項
  selectedDish.value = dish;
  selectedDishType.value = type;
  
  // 重置外帶選項
  takeoutOptions.value = {
    separatePackaging: false,
    noUtensils: false
  };
};

// 切換外帶選項
const toggleTakeoutOption = (option) => {
  takeoutOptions.value[option] = !takeoutOptions.value[option];
  updateRemarksWithTakeoutOptions();
};

// 更新備註（包含外帶選項）
const updateRemarksWithTakeoutOptions = () => {
  if (!orderStore.currentItem) return;
  
  // 獲取當前備註
  let remarks = orderStore.currentItem.remarks || '';
  
  // 清除現有的外帶選項
  remarks = remarks
    .replace(/,?\s*分開包裝/g, '')
    .replace(/,?\s*不需餐具/g, '')
    .trim();
    
  // 添加選中的外帶選項
  const options = [];
  
  if (takeoutOptions.value.separatePackaging) {
    options.push('分開包裝');
  }
  
  if (takeoutOptions.value.noUtensils) {
    options.push('不需餐具');
  }
  
  if (options.length > 0) {
    remarks = remarks ? 
      `${remarks}, ${options.join(', ')}` : 
      options.join(', ');
  }
  
  // 更新當前項目的備註
  if (orderStore.currentItem) {
    orderStore.currentItem.remarks = remarks;
    orderStore.syncCurrentItemToCart();
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
  takeoutOptions.value = {
    separatePackaging: false,
    noUtensils: false
  };
};

// 監聽 store 中的當前項目變化
watch(() => orderStore.currentItem, (newItem) => {
  if (newItem && orderStore.currentItemIndex !== null) {
    // 如果是從購物車編輯，根據當前項目更新選中的菜品
    // 從備註中提取外帶選項
    if (newItem.remarks) {
      takeoutOptions.value.separatePackaging = newItem.remarks.includes('分開包裝');
      takeoutOptions.value.noUtensils = newItem.remarks.includes('不需餐具');
    }
    
    // 找到對應的菜品
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
    takeoutOptions.value = {
      separatePackaging: false,
      noUtensils: false
    };
  }
}, { immediate: true });
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

.doneness-card, .sauce-card, .extra-option-card, .addon-card, .meat-card, .takeout-option-card {
  cursor: pointer;
  transition: all 0.2s;
  height: 100%;
  font-size: 0.85rem;
}

.card-body {
  padding: 0.5rem !important;
}

.doneness-card:hover, .sauce-card:hover, .extra-option-card:hover, 
.addon-card:hover, .meat-card:hover, .takeout-option-card:hover {
  background-color: #f8f9fa;
}

.doneness-card.selected, .sauce-card.selected, .extra-option-card.selected, 
.addon-card.selected, .meat-card.selected, .takeout-option-card.selected {
  background-color: #e2f3f5;
  border-color: #0d6efd;
}

.card-body p.mb-0 {
  margin-bottom: 0;
}
</style>