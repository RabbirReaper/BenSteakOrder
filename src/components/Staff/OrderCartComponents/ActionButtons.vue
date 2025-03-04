<template>
  <div class="action-buttons mt-3 pt-3 border-top">
    <template v-if="isOrdersActive && selectedOrder">
      <!-- 訂單管理模式下的按鈕 -->
      <div class="btn-group w-100 mb-2">
        <button class="btn btn-success" @click="$emit('updateOrderStatus', selectedOrder._id, 'Completed')"
          :disabled="selectedOrder.orderStatus === 'Completed' || selectedOrder.orderStatus === 'Canceled'">
          <i class="bi bi-credit-card me-1"></i> 結帳
        </button>
        <button class="btn btn-danger" @click="$emit('updateOrderStatus', selectedOrder._id, 'Canceled')"
          :disabled="selectedOrder.orderStatus === 'Canceled'">
          <i class="bi bi-x-circle me-1"></i> 取消訂單
        </button>
      </div>
      <button class="btn btn-secondary w-100" @click="$emit('printOrder')" :disabled="!selectedOrder">
        <i class="bi bi-printer me-1"></i> 列印訂單
      </button>
    </template>

    <template v-else>
      <!-- 購物車模式下的按鈕 -->
      <button class="btn btn-danger mb-2 w-100" :disabled="cartLength === 0"
        @click="$emit('cancelOrder')">
        取消訂單
      </button>
      <button class="btn btn-secondary mb-2 w-100" disabled>
        重印訂單
      </button>
      <button class="btn btn-success w-100" :disabled="cartLength === 0" @click="$emit('submitOrder')">
        提交訂單
      </button>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  isOrdersActive: {
    type: Boolean,
    required: true
  },
  selectedOrder: {
    type: Object,
    default: null
  },
  cartLength: {
    type: Number,
    default: 0
  }
});

defineEmits(['updateOrderStatus', 'printOrder', 'cancelOrder', 'submitOrder']);
</script>

<style scoped>
.btn {
  font-weight: 500;
}
</style>