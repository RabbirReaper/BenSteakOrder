<template>
  <div v-if="visible" class="modal-backdrop show"></div>
  <div v-if="visible" class="modal fade show d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">訂單詳情 #{{ order.orderNumber }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div v-if="!order" class="text-center py-3">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">載入中...</span>
            </div>
          </div>
          <div v-else>
            <!-- 訂單基本信息 -->
            <div class="card mb-3">
              <div class="card-header bg-light">
                <h6 class="mb-0">基本信息</h6>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <p class="mb-1"><strong>訂單編號:</strong> {{ order.orderNumber }}</p>
                    <p class="mb-1"><strong>訂單時間:</strong> {{ formatDateTime(order.createdAt) }}</p>
                    <p class="mb-1"><strong>店家:</strong> {{
                      typeof order.store === 'object' ? order.store?.name : '未知店家'
                    }}</p>
                    <p class="mb-1"><strong>下單平台:</strong> {{ order.platform }}</p>
                  </div>
                  <div class="col-md-6">
                    <p class="mb-1">
                      <strong>取餐方式:</strong>
                      <span :class="getPickupMethodClass(order.pickupMethod)">
                        {{ order.pickupMethod }}
                      </span>
                    </p>
                    <p v-if="order.tableNumber" class="mb-1">
                      <strong>桌號:</strong> {{ order.tableNumber }}
                    </p>
                    <p v-if="order.deliveryAddress" class="mb-1">
                      <strong>外送地址:</strong> {{ order.deliveryAddress }}
                    </p>
                    <p class="mb-1">
                      <strong>訂單狀態:</strong>
                      <span :class="getOrderStatusClass(order.orderStatus)">
                        {{ formatOrderStatus(order.orderStatus) }}
                      </span>
                    </p>
                    <p class="mb-1"><strong>付款方式:</strong> {{ order.paymentMethod }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 訂單項目 -->
            <div class="card mb-3">
              <div class="card-header bg-light">
                <h6 class="mb-0">訂單項目</h6>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>項目</th>
                        <th>選項</th>
                        <th>數量</th>
                        <th>金額</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in order.items" :key="index">
                        <td>{{ getDishName(item) }}</td>
                        <td>
                          <div v-if="item.options">
                            <div v-if="item.options.doneness" class="mb-1">
                              <small><strong>熟度:</strong> {{ item.options.doneness
                              }}</small>
                            </div>
                            <div v-if="item.options.sauce" class="mb-1">
                              <small><strong>醬料:</strong> {{ item.options.sauce }}</small>
                            </div>
                            <div v-if="item.options.addons && item.options.addons.length" class="mb-1">
                              <small><strong>加點:</strong> {{
                                formatAddons(item.options.addons) }}</small>
                            </div>
                            <div v-if="item.options.extraOptions && item.options.extraOptions.length" class="mb-1">
                              <small><strong>額外需求:</strong> {{
                                item.options.extraOptions.join(', ') }}</small>
                            </div>
                            <div v-if="item.options.additionalMeats && item.options.additionalMeats.length"
                              class="mb-1">
                              <small><strong>加點肉品:</strong> {{
                                formatAdditionalMeats(item.options.additionalMeats)
                              }}</small>
                            </div>
                            <div v-if="item.options.remarks" class="mb-1">
                              <small><strong>備註:</strong> {{ item.options.remarks
                              }}</small>
                            </div>
                          </div>
                        </td>
                        <td>{{ item.amount || 1 }}</td>
                        <td>${{ item.thisMoney }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- 金額摘要 -->
            <div class="card mb-3">
              <div class="card-header bg-light">
                <h6 class="mb-0">金額摘要</h6>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="d-flex justify-content-between mb-2">
                    <span>商品金額:</span>
                    <span>${{ order.orderAmount }}</span>
                  </div>
                  <div v-if="order.discounts" class="d-flex justify-content-between mb-2">
                    <span>現場折扣:</span>
                    <span>{{ order.discounts > 0 ? '-' : '+' }}${{ Math.abs(order.discounts)
                    }}</span>
                  </div>
                  <div v-if="order.pointsDiscount" class="d-flex justify-content-between mb-2">
                    <span>點數折抵:</span>
                    <span>-${{ order.pointsDiscount }}</span>
                  </div>
                  <div v-if="order.deliveryFee" class="d-flex justify-content-between mb-2">
                    <span>外送費:</span>
                    <span>${{ order.deliveryFee }}</span>
                  </div>
                  <div class="d-flex justify-content-between fw-bold border-top pt-2 mt-2">
                    <span>實付金額:</span>
                    <span>${{ order.totalMoney }}</span>
                  </div>
                  <div class="d-flex justify-content-between text-danger mt-2">
                    <span>手續費 ({{ calculateFeeRate(order) * 100 }}%):</span>
                    <span>${{ calculateFee(order) }}</span>
                  </div>
                  <div class="d-flex justify-content-between text-success fw-bold mt-2">
                    <span>實際利潤:</span>
                    <span>${{ order.totalMoney - calculateFee(order) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 其他備註 -->
            <div v-if="order.remarks" class="card mb-3">
              <div class="card-header bg-light">
                <h6 class="mb-0">訂單備註</h6>
              </div>
              <div class="card-body">
                <p class="mb-0">{{ order.remarks }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">關閉</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  order: {
    type: Object,
    default: () => ({})  // 提供默認空物件而非要求必須
  },
  visible: {
    type: Boolean,
    default: false
  }
});

defineEmits(['close']);

// 格式化日期時間
const formatDateTime = (dateStr) => {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

// 獲取取餐方式的樣式類別
const getPickupMethodClass = (method) => {
  const classes = {
    '內用': 'badge text-bg-primary',
    '自取': 'badge text-bg-success',
    '外送': 'badge text-bg-warning'
  };

  return classes[method] || 'badge text-bg-secondary';
};

// 獲取訂單狀態的樣式類別
const getOrderStatusClass = (status) => {
  const classes = {
    'Unpaid': 'badge text-bg-warning',
    'Completed': 'badge text-bg-success',
    'Canceled': 'badge text-bg-danger'
  };

  return classes[status] || 'badge text-bg-secondary';
};

// 格式化訂單狀態
const formatOrderStatus = (status) => {
  const statusMap = {
    'Unpaid': '未結帳',
    'Completed': '已完成',
    'Canceled': '已取消'
  };

  return statusMap[status] || status;
};

// 獲取餐點名稱
const getDishName = (item) => {
  if (item.itemId) {
    if (typeof item.itemId === 'object') {
      return item.itemId.name;
    } else {
      return `餐點 #${item.itemId}`;
    }
  }
  return '未知餐點';
};

// 格式化加點
const formatAddons = (addons) => {
  if (!addons || !addons.length) return '';

  return addons.map(addon => {
    if (typeof addon === 'object' && addon !== null) {
      return addon.name || '未知加點';
    }
    return '未知加點';
  }).join(', ');
};

// 格式化加點肉品
const formatAdditionalMeats = (meats) => {
  if (!meats || !meats.length) return '';

  return meats.map(meat => {
    if (typeof meat === 'object' && meat !== null) {
      return meat.name || '未知肉品';
    }
    return '未知肉品';
  }).join(', ');
};

// 計算手續費率
const calculateFeeRate = (order) => {
  switch (order.paymentMethod) {
    case 'linepay':
      return 0.03;
    case 'FoodPanda':
      return 0.25;
    case 'UberEat':
      return 0.33;
    default:
      return 0;
  }
};

// 計算手續費
const calculateFee = (order) => {
  const feeRate = calculateFeeRate(order);
  return Math.floor((order.totalMoney || 0) * feeRate);
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.card {
  border: 1px solid rgba(0, 0, 0, 0.125);
}
</style>