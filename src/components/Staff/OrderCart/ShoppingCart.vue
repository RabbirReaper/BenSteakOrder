<template>
  <div>
    <h5 class="mb-3">訂單詳情</h5>
    <div v-if="cart.length === 0" class="text-center p-5 text-muted">
      <p>尚未選擇餐點</p>
    </div>
    <div v-else>
      <div v-for="(item, index) in cart" :key="index" class="cart-item card mb-3 border-0 shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h6 class="card-title mb-0 fw-bold">{{ item.name }}</h6>
            <div class="d-flex">
              <div class="item-price fw-bold me-2">${{ (item.price * item.quantity) }}</div>
              <button class="btn btn-sm btn-outline-danger" @click="$emit('removeFromCart', index)">
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
            <button class="btn btn-sm btn-outline-secondary" @click="$emit('selectCurrentItem', item, index)">
              <i class="bi bi-pencil"></i> 編輯
            </button>

            <div class="quantity-control d-flex align-items-center">
              <button class="btn btn-sm btn-outline-secondary"
                @click="$emit('updateQuantity', index, -1)">-</button>
              <span class="mx-2">{{ item.quantity }}</span>
              <button class="btn btn-sm btn-outline-secondary"
                @click="$emit('updateQuantity', index, 1)">+</button>
            </div>
          </div>
        </div>
      </div>

      <div class="order-total mt-3">
        <div class="d-flex justify-content-between mb-2">
          <span>小計</span>
          <span>${{ subtotal }}</span>
        </div>

        <!-- 訂單調帳 -->
        <div class="d-flex justify-content-between mb-2">
          <div class="d-flex align-items-center">
            <span>訂單調帳</span>
            <button class="btn btn-sm btn-outline-secondary ms-2" @click="$emit('openAdjustmentModal')">
              <i class="bi bi-pencil-square"></i>
            </button>
          </div>
          <span :class="{ 'text-success': adjustment < 0, 'text-danger': adjustment > 0 }">
            {{ adjustment < 0 ? '+' : '' }}${{ Math.abs(adjustment) }}
          </span>
        </div>

        <!-- 訂單折扣 -->
        <div class="d-flex justify-content-between mb-2">
          <div class="d-flex align-items-center">
            <span>訂單折扣</span>
            <button class="btn btn-sm btn-outline-secondary ms-2" @click="$emit('openDiscountModal')">
              <i class="bi bi-percent"></i>
            </button>
          </div>
          <span class="text-danger">${{ discount }}</span>
        </div>

        <div class="d-flex justify-content-between fw-bold">
          <span>總計</span>
          <span>${{ total }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  cart: {
    type: Array,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  adjustment: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
});

defineEmits([
  'removeFromCart', 
  'selectCurrentItem', 
  'updateQuantity', 
  'openAdjustmentModal', 
  'openDiscountModal'
]);

// 格式化加點配料
const formatAddons = (addons) => {
  return addons.map(addon => addon.name || "未知加點").join(', ');
};

// 格式化額外肉品
const formatAdditionalMeats = (additionalMeats) => {
  return additionalMeats.map(meat => meat.name || "未知肉品").join(', ');
};
</script>

<style scoped>
.cart-item {
  border-radius: 8px;
}

.card-body {
  padding: 1rem 1.25rem;
}

.item-details {
  padding-left: 0.5rem;
}
.order-total{
  padding: 0.5rem;
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
</style>