<template>
  <div>
    <h5 class="mb-3">訂單詳情 #{{ selectedOrder.orderNumber }}</h5>

    <!-- 餐點明細 -->
    <h6 class="fw-bold mb-2">餐點明細</h6>
    <div class="list-group mb-3">
      <div v-for="(item, index) in selectedOrder.items" :key="index" class="list-group-item">
        <div class="d-flex justify-content-between">
          <div class="item-details">
            <!-- 餐點名稱 -->
            <h6 class="mb-2 fw-bold">{{ getItemName(item) }}</h6>

            <!-- 選項列表 -->
            <div class="options small">
              <div v-if="item.options.doneness" class="mb-1">
                <span class="text-muted">熟度:</span> {{ item.options.doneness }}
              </div>

              <div v-if="item.options.sauce" class="mb-1">
                <span class="text-muted">醬料:</span> {{ item.options.sauce }}
              </div>

              <div v-if="item.options.addons && item.options.addons.length" class="mb-1">
                <span class="text-muted">加點:</span> {{ formatAddons(item.options.addons) }}
              </div>

              <div v-if="item.options.additionalMeats && item.options.additionalMeats.length" class="mb-1">
                <span class="text-muted">加點肉品:</span> {{ formatAdditionalMeats(item.options.additionalMeats) }}
              </div>

              <div v-if="item.options.extraOptions && item.options.extraOptions.length" class="mb-1">
                <span class="text-muted">額外需求:</span> {{ item.options.extraOptions.join(', ') }}
              </div>

              <div v-if="item.options.remarks" class="mb-1">
                <span class="text-muted">備註:</span> {{ item.options.remarks }}
              </div>
            </div>
          </div>

          <div class="text-end d-flex flex-column justify-content-between">
            <span class="badge bg-secondary mb-2">x{{ item.amount }}</span>
            <span class="fw-bold text-primary">${{ item.thisMoney.toLocaleString('en-US') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 訂單總計 -->
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between mb-2">
          <span>小計</span>
          <span>${{ selectedOrder.orderAmount.toLocaleString('en-US') }}</span>
        </div>

        <!-- 訂單調帳 -->
        <div class="d-flex justify-content-between mb-2">
          <div class="d-flex align-items-center">
            <span>訂單調帳</span>
            <button class="btn btn-sm btn-outline-secondary ms-2"
              @click="$emit('openAdjustmentModal', selectedOrder)"
              :disabled="selectedOrder.orderStatus !== 'Unpaid'">
              <i class="bi bi-pencil-square"></i>
            </button>
          </div>
          <span
            :class="{ 'text-success': selectedOrder.discounts < 0, 'text-danger': selectedOrder.discounts > 0 }">
            {{ selectedOrder.discounts < 0 ? '+' : '-' }}${{ Math.abs(selectedOrder.discounts || 0) }}
          </span>
        </div>

        <!-- 訂單折扣 -->
        <div class="d-flex justify-content-between mb-2">
          <div class="d-flex align-items-center">
            <span>訂單折扣</span>
            <button class="btn btn-sm btn-outline-secondary ms-2"
              @click="$emit('openDiscountModal', selectedOrder)"
              :disabled="selectedOrder.orderStatus !== 'Unpaid'">
              <i class="bi bi-percent"></i>
            </button>
          </div>
          <span class="text-danger">${{ selectedOrder.pointsDiscount || 0 }}</span>
        </div>

        <div class="d-flex justify-content-between fw-bold border-top pt-2 mt-2">
          <span>總計</span>
          <span>${{ selectedOrder.totalMoney.toLocaleString('en-US') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useOrderStore } from '@/stores/order';

const props = defineProps({
  selectedOrder: {
    type: Object,
    required: true
  }
});

defineEmits(['openAdjustmentModal', 'openDiscountModal']);

const orderStore = useOrderStore();

// 格式化加點配料
const formatAddons = (addons) => {
  return addons.map(addon => addon.name || "未知加點").join(', ');
};

// 格式化額外肉品
const formatAdditionalMeats = (additionalMeats) => {
  return additionalMeats.map(meat => meat.name || "未知肉品").join(', ');
};

// 獲取餐點名稱
const getItemName = (item) => {
  return orderStore.getItemName(item);
};
</script>

<style scoped>
.list-group-item {
  border-radius: 8px;
  margin-bottom: 8px;
}
</style>