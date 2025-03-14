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
              <div class="card-body"
                :class="{ 'selected': orderStore.currentItem?.id === dish._id && orderStore.currentItem?.itemModel === 'MainDish' }">
                <h6 class="card-title fs-5">{{ dish.name }}</h6>
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
                    <p class="fs-5 fw-bold mb-0">{{ doneness }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 醬料選擇 - 改為按鈕 -->
          <div class="mb-4 sauce-section" v-if="selectedDish.sauceOptions && selectedDish.sauceOptions.length">
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
                    <p class="fs-5 fw-bold mb-0">{{ sauce }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 額外需求 - 改為按鈕 -->
          <div class="mb-4 extra-section" v-if="selectedDish.extraOptions && selectedDish.extraOptions.length">
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
                    <p class="fs-5 fw-bold mb-0">{{ option }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 加點配料 -->
          <div class="mb-4 addon-section">
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

// 選擇菜品 - 直接添加到購物車
const selectDish = (dish, type) => {
  // 將菜品添加到購物車
  orderStore.addDishToCart(dish, type);
  
  // 設置選中的菜品用於顯示選項
  selectedDish.value = dish;
  selectedDishType.value = type;
};

// 取消選擇
const cancelSelection = () => {
  resetSelection();
};

// 重置選擇
const resetSelection = () => {
  selectedDish.value = null;
  selectedDishType.value = null;
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

.doneness-card, .sauce-card, .extra-option-card, .addon-card, .meat-card {
  cursor: pointer;
  transition: all 0.2s;
  height: 100%;
  font-size: 0.85rem;
  border-width: 2px;
}

.card-body {
  padding: 0.5rem !important;
}

.doneness-card:hover, .sauce-card:hover, .extra-option-card:hover, .addon-card:hover, .meat-card:hover {
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