<template>
  <div class="action-buttons mt-3 pt-3 border-top">
    <template v-if="isOrdersActive && selectedOrder">
      <!-- 訂單管理模式下的按鈕 -->
      <div class="d-flex justify-content-between mb-3">
        <button class="btn btn-danger btn-lg" style="width: 48%"
          @click="$emit('updateOrderStatus', selectedOrder._id, 'Canceled')"
          :disabled="selectedOrder.orderStatus === 'Completed' || selectedOrder.orderStatus === 'Canceled'">
          <i class="bi bi-x-circle me-1"></i> 取消訂單
        </button>
        <button class="btn btn-secondary btn-lg" style="width: 48%" @click="$emit('printOrder')"
          :disabled="!selectedOrder">
          <i class="bi bi-printer me-1"></i> 列印訂單
        </button>
      </div>
      <button class="btn btn-success btn-lg w-100 py-3"
        @click="$emit('updateOrderStatus', selectedOrder._id, 'Completed')"
        :disabled="selectedOrder.orderStatus === 'Completed' || selectedOrder.orderStatus === 'Canceled'">
        <i class="bi bi-credit-card me-1"></i> 結帳
      </button>
    </template>

    <template v-else>
      <!-- 購物車模式下的按鈕 -->
      <div class="d-flex justify-content-between mb-3">
        <button class="btn btn-danger btn-lg" style="width: 48%" :disabled="cartLength === 0"
          @click="$emit('cancelOrder')">
          <i class="bi bi-x-circle me-1"></i> 取消訂單
        </button>
        <button class="btn btn-secondary btn-lg" style="width: 48%" disabled>
          <i class="bi bi-printer me-1"></i> 重印訂單
        </button>
      </div>
      <button class="btn btn-success btn-lg w-100 py-3" :disabled="cartLength === 0 || isCheckingOut"
        @click="handleSubmit">
        <template v-if="isCheckingOut">
          <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          處理中...
        </template>
        <template v-else>
          <i class="bi bi-check-circle me-1"></i> 提交訂單
        </template>
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';

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
  },
  isCheckingOut: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['updateOrderStatus', 'printOrder', 'cancelOrder', 'submitOrder']);

// 處理提交按鈕點擊
const handleSubmit = () => {
  if (props.isCheckingOut) return; // 防止重複點擊
  emit('submitOrder');
};
</script>

<style scoped>
.btn {
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-lg {
  font-size: 1.1rem;
  border-radius: 8px;
}

.btn-success {
  font-size: 1.25rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-success:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

/* 添加旋轉動畫的自定義樣式 */
.spinner-border {
  vertical-align: middle;
}

/* 禁用按鈕時的樣式 */
.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>