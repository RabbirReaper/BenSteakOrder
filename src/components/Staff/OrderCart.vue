<template>
  <div class="bg-light sidebar py-3 d-flex flex-column">
    <!-- 購物車詳情 -->
    <div class="order-details flex-grow-1 overflow-auto">
      <template v-if="orderStore.selectedOrder && isOrdersActive">
        <!-- 訂單詳情模式 -->
        <h5 class="mb-3">訂單詳情 #{{ orderStore.selectedOrder.orderNumber }}</h5>
        <div class="card mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <p class="mb-1"><strong>取餐方式: </strong> {{ orderStore.selectedOrder.pickupMethod }}</p>
              <span :class="orderStore.getStatusClass(orderStore.selectedOrder.orderStatus)">
                {{ orderStore.formatStatus(orderStore.selectedOrder.orderStatus) }}
              </span>
            </div>
            <p class="mb-1"><strong>訂單時間: </strong> {{ orderStore.formatDateTime(orderStore.selectedOrder.createdAt) }}
            </p>
            <p v-if="orderStore.selectedOrder.tableNumber" class="mb-1">
              <strong>桌號: </strong> {{ orderStore.selectedOrder.tableNumber }}
            </p>
            <p v-if="orderStore.selectedOrder.deliveryAddress" class="mb-1">
              <strong>外送地址: </strong> {{ orderStore.selectedOrder.deliveryAddress }}
            </p>
            <p v-if="orderStore.selectedOrder.remarks" class="mb-1">
              <strong>備註: </strong> {{ orderStore.selectedOrder.remarks }}
            </p>
          </div>
        </div>

        <!-- 餐點明細 -->
        <h6 class="fw-bold mb-2">餐點明細</h6>
        <div class="list-group mb-3">
          <div v-for="(item, index) in orderStore.selectedOrder.items" :key="index" class="list-group-item">
            <div class="d-flex justify-content-between">
              <div class="item-details">
                <!-- 餐點名稱 -->
                <h6 class="mb-2 fw-bold">{{ orderStore.getItemName(item) }}</h6>

                <!-- 選項列表 -->
                <div class="options small">
                  <div v-if="item.options.doneness" class="mb-1">
                    <span class="text-muted">熟度:</span> {{ item.options.doneness }}
                  </div>

                  <div v-if="item.options.sauce" class="mb-1">
                    <span class="text-muted">醬料:</span> {{ item.options.sauce }}
                  </div>

                  <div v-if="item.options.addons && item.options.addons.length" class="mb-1">
                    <span class="text-muted">加點:</span> {{ orderStore.formatAddons(item.options.addons) }}
                  </div>

                  <div v-if="item.options.additionalMeats && item.options.additionalMeats.length" class="mb-1">
                    <span class="text-muted">加點肉品:</span> {{
                      orderStore.formatAdditionalMeats(item.options.additionalMeats) }}
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
                <span class="fw-bold text-primary">${{ item.thisMoney }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 訂單總計 -->
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between mb-2">
              <span>小計</span>
              <span>${{ orderStore.selectedOrder.orderAmount }}</span>
            </div>

            <!-- 訂單調帳 -->
            <div class="d-flex justify-content-between mb-2">
              <div class="d-flex align-items-center">
                <span>訂單調帳</span>
                <button class="btn btn-sm btn-outline-secondary ms-2"
                  @click="openAdjustmentModal(orderStore.selectedOrder)"
                  :disabled="orderStore.selectedOrder.orderStatus !== 'Unpaid'">
                  <i class="bi bi-pencil-square"></i>
                </button>
              </div>
              <span
                :class="{ 'text-success': orderStore.selectedOrder.discounts < 0, 'text-danger': orderStore.selectedOrder.discounts > 0 }">
                {{ orderStore.selectedOrder.discounts < 0 ? '+' : '-' }}${{ Math.abs(orderStore.selectedOrder.discounts
                  || 0) }} </span>
            </div>

            <!-- 訂單折扣 -->
            <div class="d-flex justify-content-between mb-2">
              <div class="d-flex align-items-center">
                <span>訂單折扣</span>
                <button class="btn btn-sm btn-outline-secondary ms-2"
                  @click="openDiscountModal(orderStore.selectedOrder)"
                  :disabled="orderStore.selectedOrder.orderStatus !== 'Unpaid'">
                  <i class="bi bi-percent"></i>
                </button>
              </div>
              <span class="text-danger">${{ orderStore.selectedOrder.pointsDiscount || 0 }}</span>
            </div>

            <div class="d-flex justify-content-between fw-bold border-top pt-2 mt-2">
              <span>總計</span>
              <span>${{ orderStore.selectedOrder.totalMoney }}</span>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <!-- 購物車模式 -->
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
                  <button class="btn btn-sm btn-outline-secondary"
                    @click="orderStore.updateQuantity(index, -1)">-</button>
                  <span class="mx-2">{{ item.quantity }}</span>
                  <button class="btn btn-sm btn-outline-secondary"
                    @click="orderStore.updateQuantity(index, 1)">+</button>
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
                <button class="btn btn-sm btn-outline-secondary ms-2" @click="openCartAdjustmentModal">
                  <i class="bi bi-pencil-square"></i>
                </button>
              </div>
              <span :class="{ 'text-success': orderStore.adjustment < 0, 'text-danger': orderStore.adjustment > 0 }">
                {{ orderStore.adjustment < 0 ? '+' : '' }}${{ Math.abs(orderStore.adjustment) }} </span>
            </div>

            <!-- 訂單折扣 -->
            <div class="d-flex justify-content-between mb-2">
              <div class="d-flex align-items-center">
                <span>訂單折扣</span>
                <button class="btn btn-sm btn-outline-secondary ms-2" @click="openCartDiscountModal">
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
      </template>
    </div>

    <!-- 操作按鈕 -->
    <div class="action-buttons mt-3 pt-3 border-top">
      <template v-if="isOrdersActive && orderStore.selectedOrder">
        <!-- 訂單管理模式下的按鈕 -->
        <div class="btn-group w-100 mb-2">
          <button class="btn btn-success" @click="updateOrderStatus(orderStore.selectedOrder._id, 'Completed')"
            :disabled="orderStore.selectedOrder.orderStatus === 'Completed' || orderStore.selectedOrder.orderStatus === 'Canceled'">
            <i class="bi bi-check-circle me-1"></i> 完成訂單
          </button>
          <button class="btn btn-danger" @click="updateOrderStatus(orderStore.selectedOrder._id, 'Canceled')"
            :disabled="orderStore.selectedOrder.orderStatus === 'Canceled'">
            <i class="bi bi-x-circle me-1"></i> 取消訂單
          </button>
        </div>
        <button class="btn btn-secondary w-100" @click="printOrder" :disabled="!orderStore.selectedOrder">
          <i class="bi bi-printer me-1"></i> 列印訂單
        </button>
      </template>

      <template v-else>
        <!-- 購物車模式下的按鈕 -->
        <button class="btn btn-danger mb-2 w-100" :disabled="orderStore.cart.length === 0"
          @click="orderStore.cancelOrder()">
          取消訂單
        </button>
        <button class="btn btn-secondary mb-2 w-100" disabled>
          重印訂單
        </button>
        <button class="btn btn-success w-100" :disabled="orderStore.cart.length === 0" @click="submitOrder">
          提交訂單
        </button>
      </template>
    </div>
  </div>

  <!-- 調帳 Modal -->
  <div v-if="showAdjustmentModal" class="custom-modal-container">
    <div class="custom-modal-overlay" @click="showAdjustmentModal = false"></div>
    <div class="custom-modal-dialog">
      <div class="custom-modal-content">
        <div class="custom-modal-header">
          <h5 class="custom-modal-title">訂單調帳</h5>
          <button type="button" class="btn-close" @click="showAdjustmentModal = false"></button>
        </div>
        <div class="custom-modal-body">
          <div class="text-center mb-3">
            <h4>{{ adjustmentType === 'add' ? '+' : '-' }}${{ tempAdjustment }}</h4>
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
        <div class="custom-modal-footer">
          <button type="button" class="btn btn-secondary" @click="showAdjustmentModal = false">取消</button>
          <button type="button" class="btn btn-primary" @click="confirmAdjustment()">確認</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 折扣 Modal -->
  <div v-if="showDiscountModal" class="custom-modal-container">
    <div class="custom-modal-overlay" @click="showDiscountModal = false"></div>
    <div class="custom-modal-dialog">
      <div class="custom-modal-content">
        <div class="custom-modal-header">
          <h5 class="custom-modal-title">訂單折扣</h5>
          <button type="button" class="btn-close" @click="showDiscountModal = false"></button>
        </div>
        <div class="custom-modal-body">
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
        <div class="custom-modal-footer">
          <button type="button" class="btn btn-secondary" @click="showDiscountModal = false">取消</button>
          <button type="button" class="btn btn-primary" @click="confirmDiscount()">確認</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useOrderStore } from '@/stores/order';
import { useRoute } from 'vue-router';
import axios from 'axios';

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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 調帳和折扣相關狀態
const showAdjustmentModal = ref(false);
const showDiscountModal = ref(false);
const tempAdjustment = ref(0);
const tempDiscount = ref(0);
const adjustmentType = ref('add'); // 'add' 或 'subtract'
const editingOrder = ref(null); // 當前正在編輯的訂單

// 計算屬性
const isOrdersActive = computed(() => orderStore.activeComponent === 'Orders');

// 方法
const formatAddons = (addons) => {
  return addons.map(addon => addon.name || "未知加點").join(', ');
};

const formatAdditionalMeats = (additionalMeats) => {
  return additionalMeats.map(meat => meat.name || "未知肉品").join(', ');
};

// 更新訂單狀態
const updateOrderStatus = async (orderId, status) => {
  if (confirm(`確定要將訂單狀態更新為${orderStore.formatStatus(status)}嗎？`)) {
    await orderStore.updateOrderStatus(orderId, status);
  }
};

// 列印訂單
const printOrder = () => {
  if (!orderStore.selectedOrder) return;

  // 創建列印窗口
  const printWindow = window.open('', '_blank');

  // 創建列印內容
  const order = orderStore.selectedOrder;
  let printContent = `
    <html>
      <head>
        <title>訂單 #${order.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2 { margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>訂單 #${order.orderNumber}</h1>
        <p><strong>訂單時間：</strong> ${orderStore.formatDateTime(order.createdAt)}</p>
        <p><strong>取餐方式：</strong> ${order.pickupMethod}</p>
        ${order.tableNumber ? `<p><strong>桌號：</strong> ${order.tableNumber}</p>` : ''}
        ${order.deliveryAddress ? `<p><strong>外送地址：</strong> ${order.deliveryAddress}</p>` : ''}
        <p><strong>付款方式：</strong> ${order.paymentMethod}</p>
        ${order.remarks ? `<p><strong>備註：</strong> ${order.remarks}</p>` : ''}
        
        <h2>餐點明細</h2>
        <table>
          <thead>
            <tr>
              <th>餐點</th>
              <th>選項</th>
              <th>數量</th>
              <th>金額</th>
            </tr>
          </thead>
          <tbody>
  `;

  // 添加餐點明細
  order.items.forEach(item => {
    printContent += `
      <tr>
        <td>${item.itemId.name}</td>
        <td>
          ${item.options.doneness ? `熟度: ${item.options.doneness}<br>` : ''}
          ${item.options.sauce ? `醬料: ${item.options.sauce}<br>` : ''}
          ${item.options.addons && item.options.addons.length ? `加點: ${orderStore.formatAddons(item.options.addons)}<br>` : ''}
          ${item.options.extraOptions && item.options.extraOptions.length ? `額外需求: ${item.options.extraOptions.join(', ')}<br>` : ''}
          ${item.options.remarks ? `備註: ${item.options.remarks}` : ''}
        </td>
        <td>${item.amount}</td>
        <td>${item.thisMoney}</td>
      </tr>
    `;
  });

  // 添加總計
  printContent += `
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right;"><strong>總計：</strong></td>
              <td class="total">${order.totalMoney}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="text-align: center; margin-top: 40px;">
          <p>感謝您的惠顧！</p>
        </div>
      </body>
    </html>
  `;

  // 寫入並列印
  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();

  // 等待圖片載入
  setTimeout(() => {
    printWindow.print();
  }, 500);
};

// 提交訂單
const submitOrder = async () => {
  await orderStore.checkout(storeId);
};

// ======= 調帳相關函數 =======

// 購物車調帳
const openCartAdjustmentModal = () => {
  tempAdjustment.value = Math.abs(orderStore.adjustment);
  // 修正：adjustment > 0 表示減少價格（Subtract），adjustment < 0 表示增加價格（Add）
  adjustmentType.value = orderStore.adjustment > 0 ? 'subtract' : 'add';
  editingOrder.value = null;
  showAdjustmentModal.value = true;
};

// 訂單調帳
const openAdjustmentModal = (order) => {
  if (order) {
    editingOrder.value = order;
    tempAdjustment.value = Math.abs(order.discounts || 0);
    // 修正：discounts > 0 表示減少價格（Subtract），discounts < 0 表示增加價格（Add）
    adjustmentType.value = (order.discounts || 0) > 0 ? 'subtract' : 'add';
    showAdjustmentModal.value = true;
  }
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

const confirmAdjustment = async () => {
  // 修正：add 表示增加價格（折扣為負數），subtract 表示減少價格（折扣為正數）
  const newAdjustment = adjustmentType.value === 'add' ? -tempAdjustment.value : tempAdjustment.value;

  if (editingOrder.value) {
    // 更新訂單調帳
    try {
      const orderUpdate = {
        discounts: newAdjustment,
        // 重新計算總金額
        totalMoney: editingOrder.value.orderAmount - newAdjustment - (editingOrder.value.pointsDiscount || 0)
      };

      await axios.put(`${API_BASE_URL}/order/${editingOrder.value._id}`, orderUpdate);

      // 更新本地訂單資料
      editingOrder.value.discounts = newAdjustment;
      editingOrder.value.totalMoney = orderUpdate.totalMoney;

      // 刷新選中的訂單資料
      if (orderStore.selectedOrder && orderStore.selectedOrder._id === editingOrder.value._id) {
        // 獲取完整訂單詳情
        const refreshedOrder = await orderStore.fetchOrderDetails(editingOrder.value._id);
        if (refreshedOrder) {
          orderStore.selectOrder(refreshedOrder);
        }
      }
    } catch (error) {
      console.error('更新訂單調帳失敗:', error);
      alert('調整訂單失敗，請重試');
    }
  } else {
    // 更新購物車調帳
    orderStore.setAdjustment(newAdjustment);
  }

  showAdjustmentModal.value = false;
};

// ======= 折扣相關函數 =======

// 購物車折扣
const openCartDiscountModal = () => {
  tempDiscount.value = orderStore.discount;
  editingOrder.value = null;
  showDiscountModal.value = true;
};

// 訂單折扣
const openDiscountModal = (order) => {
  if (order) {
    editingOrder.value = order;
    tempDiscount.value = order.pointsDiscount || 0;
    showDiscountModal.value = true;
  }
};

const appendToDiscount = (num) => {
  tempDiscount.value = parseInt(`${tempDiscount.value}${num}`);
};

const clearDiscount = () => {
  tempDiscount.value = 0;
};

const confirmDiscount = async () => {
  if (editingOrder.value) {
    // 更新訂單折扣
    try {
      const orderUpdate = {
        pointsDiscount: tempDiscount.value,
        // 重新計算總金額
        totalMoney: editingOrder.value.orderAmount - (editingOrder.value.discounts || 0) - tempDiscount.value
      };

      await axios.put(`${API_BASE_URL}/order/${editingOrder.value._id}`, orderUpdate);

      // 更新本地訂單資料
      editingOrder.value.pointsDiscount = tempDiscount.value;
      editingOrder.value.totalMoney = orderUpdate.totalMoney;

      // 刷新選中的訂單資料
      if (orderStore.selectedOrder && orderStore.selectedOrder._id === editingOrder.value._id) {
        // 獲取完整訂單詳情
        const refreshedOrder = await orderStore.fetchOrderDetails(editingOrder.value._id);
        if (refreshedOrder) {
          orderStore.selectOrder(refreshedOrder);
        }
      }
    } catch (error) {
      console.error('更新訂單折扣失敗:', error);
      alert('調整訂單失敗，請重試');
    }
  } else {
    // 更新購物車折扣
    orderStore.setDiscount(tempDiscount.value);
  }

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

/* 自定義 Modal 樣式 */
.custom-modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.custom-modal-dialog {
  position: relative;
  width: 500px;
  max-width: 90%;
  z-index: 2;
  margin: 0 auto;
}

.custom-modal-content {
  background-color: #fff;
  border-radius: 0.3rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.custom-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.custom-modal-title {
  margin: 0;
}

.custom-modal-body {
  padding: 1rem;
  overflow-y: auto;
}

.custom-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  gap: 0.5rem;
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