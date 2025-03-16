<template>
  <div class="bg-light sidebar py-3 d-flex flex-column">
    <!-- 購物車詳情 -->
    <div class="order-details flex-grow-1 overflow-auto">
      <template v-if="orderStore.selectedOrder && isOrdersActive">
        <!-- 訂單詳情模式 -->
        <OrderDetails 
          :selected-order="orderStore.selectedOrder"
          @open-adjustment-modal="openAdjustmentModal"
          @open-discount-modal="openDiscountModal"
        />
      </template>

      <template v-else>
        <!-- 購物車模式 -->
        <ShoppingCart 
          :cart="orderStore.cart"
          :subtotal="orderStore.subtotal"
          :adjustment="orderStore.adjustment"
          :discount="orderStore.discount"
          :total="orderStore.total"
          @remove-from-cart="orderStore.removeFromCart"
          @select-current-item="orderStore.selectCurrentItem"
          @update-quantity="orderStore.updateQuantity"
          @open-adjustment-modal="openCartAdjustmentModal"
          @open-discount-modal="openCartDiscountModal"
        />
      </template>
    </div>

    <!-- 操作按鈕 -->
    <ActionButtons 
      :is-orders-active="isOrdersActive"
      :selected-order="orderStore.selectedOrder"
      :cart-length="orderStore.cart.length"
      :is-checking-out="orderStore.isCheckingOut"
      @update-order-status="updateOrderStatus"
      @print-order="printOrder"
      @cancel-order="orderStore.cancelOrder"
      @submit-order="submitOrder"
    />

    <!-- Modals -->
    <AdjustmentModal 
      v-if="showAdjustmentModal"
      :temp-adjustment="tempAdjustment"
      :adjustment-type="adjustmentType"
      @close="showAdjustmentModal = false"
      @set-adjustment-type="setAdjustmentType"
      @append-adjustment="appendToAdjustment"
      @clear-adjustment="clearAdjustment"
      @confirm="confirmAdjustment"
    />

    <DiscountModal 
      v-if="showDiscountModal"
      :temp-discount="tempDiscount"
      @close="showDiscountModal = false"
      @append-discount="appendToDiscount"
      @clear-discount="clearDiscount"
      @confirm="confirmDiscount"
    />

    <CheckoutModal
      v-if="showCheckoutModal"
      :total="checkoutTotal"
      @close="showCheckoutModal = false"
      @online-payment="handleOnlinePayment"
      @cash-payment="showCashCalculatorModal = true"
    />

    <CashCalculatorModal
      v-if="showCashCalculatorModal"
      :total="checkoutTotal"
      @close="showCashCalculatorModal = false"
      @complete="handleCashPayment"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useOrderStore } from '@/stores/order';
import { useRoute } from 'vue-router';
import axios from 'axios';

import OrderDetails from './OrderDetails.vue';
import ShoppingCart from './ShoppingCart.vue';
import ActionButtons from './ActionButtons.vue';
import AdjustmentModal from './AdjustmentModal.vue';
import DiscountModal from './DiscountModal.vue';
import CheckoutModal from './CheckoutModal.vue';
import CashCalculatorModal from './CashCalculatorModal.vue';

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

// 結帳相關狀態
const showCheckoutModal = ref(false);
const showCashCalculatorModal = ref(false);
const checkoutTotal = ref(0);
const checkoutOrderId = ref(null);

// 計算屬性
const isOrdersActive = computed(() => orderStore.activeComponent === 'Orders');

// 更新訂單狀態
const updateOrderStatus = async (orderId, status) => {
  if (status === 'Completed') {
    // 如果是完成訂單（結帳），顯示結帳模態框
    checkoutOrderId.value = orderId;
    checkoutTotal.value = orderStore.selectedOrder.totalMoney;
    showCheckoutModal.value = true;
  } else {
    await orderStore.updateOrderStatus(orderId, status);
  }
};

const ishandleOnlinePaymenting = ref(false);
// 處理線上付款
const handleOnlinePayment = async () => {
  if (ishandleOnlinePaymenting.value) return;
  ishandleOnlinePaymenting.value = true;
  try {
    await axios.put(`${API_BASE_URL}/order/${checkoutOrderId.value}`, {
      orderStatus: 'Completed',
      paymentMethod: 'linepay'
    });
    
    showCheckoutModal.value = false;
    
    // 更新本地訂單資料
    await orderStore.fetchTodayOrders(storeId);
    
    // 更新選中的訂單資料
    if (orderStore.selectedOrder && orderStore.selectedOrder._id === checkoutOrderId.value) {
      const refreshedOrder = await orderStore.fetchOrderDetails(checkoutOrderId.value);
      if (refreshedOrder) {
        orderStore.selectOrder(refreshedOrder);
      }
    }
    ishandleOnlinePaymenting.value = false;
    // alert('線上付款完成，訂單已結帳');
  } catch (error) {
    console.error('線上付款處理失敗:', error);
    alert('付款處理失敗，請重試');
  }
};


const ishandleCashPaymenting = ref(false);
// 處理現金付款
const handleCashPayment = async () => {
  if (ishandleCashPaymenting.value) return;
  ishandleCashPaymenting.value = true;
  try {
    await axios.put(`${API_BASE_URL}/order/${checkoutOrderId.value}`, {
      orderStatus: 'Completed',
      paymentMethod: '現金'
    });
    
    showCashCalculatorModal.value = false;
    showCheckoutModal.value = false;
    
    // 更新本地訂單資料
    await orderStore.fetchTodayOrders(storeId);
    
    // 更新選中的訂單資料
    if (orderStore.selectedOrder && orderStore.selectedOrder._id === checkoutOrderId.value) {
      const refreshedOrder = await orderStore.fetchOrderDetails(checkoutOrderId.value);
      if (refreshedOrder) {
        orderStore.selectOrder(refreshedOrder);
      }
    }
    ishandleCashPaymenting.value = false
    // alert('現金付款完成，訂單已結帳');
  } catch (error) {
    console.error('現金付款處理失敗:', error);
    alert('付款處理失敗，請重試');
  }
};

// 列印訂單
const printOrder = () => {
  // 實作細節保留在主元件中，因為它比較複雜且不太需要重複使用
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
  console.log('!')
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
</style>