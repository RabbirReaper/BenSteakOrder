<template>
  <div class="bg-light sidebar py-3 d-flex flex-column">
    <!-- 購物車詳情 -->
    <div class="order-details flex-grow-1 overflow-auto">
      <h5 class="mb-3">訂單詳情</h5>
      <div v-if="orderStore.cart.length === 0" class="text-center p-5 text-muted">
        <p>尚未選擇餐點</p>
      </div>
      <div v-else>
        <div v-for="(item, index) in orderStore.cart" :key="index" class="cart-item card mb-3 border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="card-title mb-0 fw-bold">{{ item.name }}</h6>
              <div class="d-flex">
                <div class="item-price fw-bold me-2">${{ (item.price * item.quantity) }}</div>
                <button class="btn btn-sm btn-outline-danger" @click="orderStore.removeFromCart(index)">
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>

            <div class="item-details mb-3">
              <p class="card-text small mb-1" v-if="item.doneness">熟度: {{ item.doneness }}</p>
              <p class="card-text small mb-1" v-if="item.sauce">醬料: {{ item.sauce }}</p>
              <p class="card-text small mb-1" v-if="item.addons && item.addons.length">
                加點: {{ formatAddons(item.addons) }}
              </p>
              <p class="card-text small mb-1" v-if="item.additionalMeats && item.additionalMeats.length">
                加點肉品: {{ formatAdditionalMeats(item.additionalMeats) }}
              </p>
              <p class="card-text small mb-1" v-if="item.extraOptions && item.extraOptions.length">
                額外需求: {{ item.extraOptions.join(', ') }}
              </p>
              <p class="card-text small mb-1" v-if="item.remarks">
                備註: {{ item.remarks }}
              </p>
            </div>

            <div class="d-flex justify-content-between align-items-center">
              <button class="btn btn-sm btn-outline-secondary" @click="orderStore.selectCurrentItem(item, index)">
                <i class="bi bi-pencil"></i> 編輯
              </button>

              <div class="quantity-control d-flex align-items-center">
                <button class="btn btn-sm btn-outline-secondary" @click="orderStore.updateQuantity(index, -1)">-</button>
                <span class="mx-2">{{ item.quantity }}</span>
                <button class="btn btn-sm btn-outline-secondary" @click="orderStore.updateQuantity(index, 1)">+</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="order-total mt-3">
          <div class="d-flex justify-content-between mb-2">
            <span>小計</span>
            <span>${{ orderStore.subtotal }}</span>
          </div>
          
          <!-- 訂單調帳 -->
          <div class="d-flex justify-content-between mb-2">
            <div class="d-flex align-items-center">
              <span>訂單調帳</span>
              <button class="btn btn-sm btn-outline-secondary ms-2" @click="openAdjustmentModal">
                <i class="bi bi-pencil-square"></i>
              </button>
            </div>
            <span :class="{'text-danger': orderStore.adjustment < 0, 'text-success': orderStore.adjustment > 0}">
              {{ orderStore.adjustment > 0 ? '+' : '' }}${{ orderStore.adjustment }}
            </span>
          </div>
          
          <!-- 訂單折扣 -->
          <div class="d-flex justify-content-between mb-2">
            <div class="d-flex align-items-center">
              <span>訂單折扣</span>
              <button class="btn btn-sm btn-outline-secondary ms-2" @click="openDiscountModal">
                <i class="bi bi-percent"></i>
              </button>
            </div>
            <span class="text-danger">${{ orderStore.discount }}</span>
          </div>
          
          <div class="d-flex justify-content-between fw-bold">
            <span>總計</span>
            <span>${{ orderStore.total }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 操作按鈕 -->
    <div class="action-buttons mt-3 pt-3 border-top">
      <button 
        class="btn btn-danger mb-2 w-100" 
        :disabled="isOrdersActive || orderStore.cart.length === 0"
        @click="orderStore.cancelOrder()"
      >
        取消訂單
      </button>
      <button 
        class="btn btn-secondary mb-2 w-100" 
        :disabled="isOrdersActive || !orderStore.selectedOrder"
        @click="reprintOrder"
      >
        重印訂單
      </button>
      <button 
        class="btn btn-success w-100" 
        :disabled="isOrdersActive || orderStore.cart.length === 0"
        @click="checkout"
      >
        結帳
      </button>
    </div>
  </div>

  <!-- 調帳 Modal -->
  <div class="modal fade" :class="{ 'show d-block': showAdjustmentModal }" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">訂單調帳</h5>
          <button type="button" class="btn-close" @click="showAdjustmentModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="text-center mb-3">
            <h4>{{ tempAdjustment >= 0 ? '+' : '' }}${{ tempAdjustment }}</h4>
          </div>
          <div class="d-flex justify-content-center mb-3">
            <button class="btn btn-success btn-lg me-3" @click="setAdjustmentType('add')">
              <i class="bi bi-plus-lg"></i>
            </button>
            <button class="btn btn-danger btn-lg" @click="setAdjustmentType('subtract')">
              <i class="bi bi-dash-lg"></i>
            </button>
          </div>
          <div class="number-keypad">
            <div class="row g-2">
              <div class="col-4" v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]" :key="num">
                <button class="btn btn-outline-secondary w-100" @click="appendToAdjustment(num)">{{ num }}</button>
              </div>
              <div class="col-4">
                <button class="btn btn-outline-secondary w-100" @click="appendToAdjustment(0)">0</button>
              </div>
              <div class="col-4">
                <button class="btn btn-outline-secondary w-100" @click="appendToAdjustment('00')">00</button>
              </div>
              <div class="col-4">
                <button class="btn btn-outline-danger w-100" @click="clearAdjustment()">清除</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showAdjustmentModal = false">取消</button>
          <button type="button" class="btn btn-primary" @click="confirmAdjustment()">確認</button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showAdjustmentModal"></div>
  </div>
  
  <!-- 折扣 Modal -->
  <div class="modal fade" :class="{ 'show d-block': showDiscountModal }" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">訂單折扣</h5>
          <button type="button" class="btn-close" @click="showDiscountModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="text-center mb-3">
            <h4>${{ tempDiscount }}</h4>
          </div>
          <div class="number-keypad">
            <div class="row g-2">
              <div class="col-4" v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]" :key="num">
                <button class="btn btn-outline-secondary w-100" @click="appendToDiscount(num)">{{ num }}</button>
              </div>
              <div class="col-4">
                <button class="btn btn-outline-secondary w-100" @click="appendToDiscount(0)">0</button>
              </div>
              <div class="col-4">
                <button class="btn btn-outline-secondary w-100" @click="appendToDiscount('00')">00</button>
              </div>
              <div class="col-4">
                <button class="btn btn-outline-danger w-100" @click="clearDiscount()">清除</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showDiscountModal = false">取消</button>
          <button type="button" class="btn btn-primary" @click="confirmDiscount()">確認</button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showDiscountModal"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useOrderStore } from '@/stores/order';
import { useRoute } from 'vue-router';

const props = defineProps({
  activeComponent: {
    type: String,
    default: 'DineIn'
  }
});

// 使用 Pinia store
const orderStore = useOrderStore();
const route = useRoute();
const storeId = route.params.storeId;

// 調帳和折扣相關狀態
const showAdjustmentModal = ref(false);
const showDiscountModal = ref(false);
const tempAdjustment = ref(0);
const tempDiscount = ref(0);
const adjustmentType = ref('add'); // 'add' 或 'subtract'

// 計算屬性
const isOrdersActive = computed(() => orderStore.activeComponent === 'Orders');

// 方法
const formatAddons = (addons) => {
  return addons.map(addon => addon.name || "未知加點").join(', ');
};

const formatAdditionalMeats = (additionalMeats) => {
  return additionalMeats.map(meat => meat.name || "未知肉品").join(', ');
};

// 重印訂單
const reprintOrder = () => {
  if (orderStore.selectedOrder) {
    alert(`重印訂單: ${orderStore.selectedOrder.orderNumber}`);
    // 這裡實現重印訂單的邏輯
  }
};

// 結帳
const checkout = async () => {
  await orderStore.checkout(storeId);
};

// 調帳相關函數
const openAdjustmentModal = () => {
  tempAdjustment.value = Math.abs(orderStore.adjustment);
  adjustmentType.value = orderStore.adjustment >= 0 ? 'add' : 'subtract';
  showAdjustmentModal.value = true;
};

const setAdjustmentType = (type) => {
  adjustmentType.value = type;
  tempAdjustment.value = 0;
};

const appendToAdjustment = (num) => {
  tempAdjustment.value = parseInt(`${tempAdjustment.value}${num}`);
};

const clearAdjustment = () => {
  tempAdjustment.value = 0;
};

const confirmAdjustment = () => {
  const newAdjustment = adjustmentType.value === 'add' ? tempAdjustment.value : -tempAdjustment.value;
  orderStore.setAdjustment(newAdjustment);
  showAdjustmentModal.value = false;
};

// 折扣相關函數
const openDiscountModal = () => {
  tempDiscount.value = orderStore.discount;
  showDiscountModal.value = true;
};

const appendToDiscount = (num) => {
  tempDiscount.value = parseInt(`${tempDiscount.value}${num}`);
};

const clearDiscount = () => {
  tempDiscount.value = 0;
};

const confirmDiscount = () => {
  orderStore.setDiscount(tempDiscount.value);
  showDiscountModal.value = false;
};
</script>

<style scoped>
.sidebar {
  height: 100vh;
  overflow-y: auto;
}

.order-details {
  max-height: calc(100vh - 200px);
}

.cart-item {
  border-radius: 8px;
}

.quantity-control button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 50%;
}

/* Modal 樣式 */
.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}

.number-keypad {
  max-width: 300px;
  margin: 0 auto;
}

.number-keypad .btn {
  height: 50px;
  font-size: 1.2rem;
}
</style>