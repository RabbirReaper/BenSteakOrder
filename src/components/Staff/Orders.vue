<template>
  <div class="container-fluid p-0">
    <div class="component-header bg-secondary text-white p-3">
      <h4>訂單管理 {{ orderStore.currentDate }}</h4>
      <div class="d-flex justify-content-between align-items-center mt-2">
        <div class="d-flex align-items-center">
          <div class="input-group input-group-sm me-2" style="max-width: 200px;">
            <input type="date" class="form-control" v-model="selectedDate" :max="orderStore.maxDate">
          </div>
          <button class="btn btn-light btn-sm me-2" @click="fetchOrders">搜尋</button>
        </div>
        <div class="d-flex">
          <select class="form-select form-select-sm me-2" style="max-width: 150px;" v-model="filterType">
            <option value="all">所有類型</option>
            <option value="內用">內用</option>
            <option value="自取">自取</option>
            <option value="外送">外送</option>
          </select>
          <select class="form-select form-select-sm" style="max-width: 150px;" v-model="filterStatus">
            <option value="all">所有狀態</option>
            <option value="Unpaid">未結帳</option>
            <option value="Completed">已完成</option>
            <option value="Canceled">已取消</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 修改表格部分的程式碼 -->
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th>時間</th>
            <th>訂單號</th>
            <th>取餐方式</th>
            <th>金額</th>
            <th>狀態</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order._id"
            :class="{ 'table-active': orderStore.selectedOrder && orderStore.selectedOrder._id === order._id }"
            @click="selectAndViewOrder(order)" class="order-row">
            <td>{{ orderStore.formatTime(order.createdAt) }}</td>
            <td class="fs-5">{{ order.orderNumber }}</td>
            <td>
              <span :class="orderStore.getPickupMethodClass(order.pickupMethod)">
                {{ order.pickupMethod }}
              </span>
              <span v-if="order.tableNumber" class="ms-1 badge bg-info">桌號: {{ order.tableNumber }}</span>
            </td>
            <td class="fs-5">${{ order.totalMoney.toLocaleString('en-US') }}</td>
            <td>
              <span :class="orderStore.getStatusClass(order.orderStatus)">
                {{ orderStore.formatStatus(order.orderStatus) }}
              </span>
              <!-- 新增付款方式 badge，僅在狀態為「已完成」時顯示 -->
              <span v-if="order.orderStatus === 'Completed'" class="ms-1 badge bg-secondary">
                <div v-if="key_value[order.paymentMethod]">{{ key_value[order.paymentMethod] }}</div>
                <div v-else>{{ order.paymentMethod }}</div>
              </span>
            </td>
          </tr>
          <tr v-if="filteredOrders.length === 0">
            <td colspan="5" class="text-center py-4">
              <p class="text-muted">沒有符合條件的訂單</p>
            </td>
          </tr>
        </tbody>
      </table>

    </div>

    <!-- 訂單詳情 Modal -->
    <div class="modal fade" id="orderDetailsModal" tabindex="-1" aria-labelledby="orderDetailsModalLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="orderDetailsModalLabel">訂單詳情 #{{ orderStore.selectedOrder ?
              orderStore.selectedOrder.orderNumber : '' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="orderStore.selectedOrder">
            <div class="row mb-3">
              <div class="col-md-6">
                <p><strong>訂單時間：</strong> {{ orderStore.formatDateTime(orderStore.selectedOrder.createdAt) }}</p>
                <p><strong>取餐方式：</strong> {{ orderStore.selectedOrder.pickupMethod }}</p>
                <p v-if="orderStore.selectedOrder.tableNumber"><strong>桌號：</strong> {{
                  orderStore.selectedOrder.tableNumber }}</p>
                <p v-if="orderStore.selectedOrder.deliveryAddress"><strong>外送地址：</strong> {{
                  orderStore.selectedOrder.deliveryAddress }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>付款方式：</strong> {{ orderStore.selectedOrder.paymentMethod }}</p>
                <p><strong>狀態：</strong> {{ orderStore.formatStatus(orderStore.selectedOrder.orderStatus) }}</p>
                <p v-if="orderStore.selectedOrder.remarks"><strong>備註：</strong> {{ orderStore.selectedOrder.remarks }}
                </p>
              </div>
            </div>

            <h6 class="mb-3">餐點明細</h6>
            <div class="table-responsive">
              <table class="table table-sm">
                <thead class="table-light">
                  <tr>
                    <th>餐點</th>
                    <th>選項</th>
                    <th>數量</th>
                    <th>金額</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in orderStore.selectedOrder.items" :key="index">
                    <td>{{ item.itemId.name }}</td>
                    <td>
                      <small v-if="item.options.doneness">熟度: {{ item.options.doneness }}<br></small>
                      <small v-if="item.options.sauce">醬料: {{ item.options.sauce }}<br></small>
                      <small v-if="item.options.addons && item.options.addons.length">
                        加點: {{ orderStore.formatAddons(item.options.addons) }}<br>
                      </small>
                      <small v-if="item.options.extraOptions && item.options.extraOptions.length">
                        額外需求: {{ item.options.extraOptions.join(', ') }}<br>
                      </small>
                      <small v-if="item.options.remarks">備註: {{ item.options.remarks }}</small>
                    </td>
                    <td>{{ item.amount }}</td>
                    <td>${{ item.thisMoney }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="text-end"><strong>總計：</strong></td>
                    <td><strong>${{ orderStore.selectedOrder.totalMoney }}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
            <button type="button" class="btn btn-success" @click="printOrder" :disabled="!orderStore.selectedOrder">
              列印訂單
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useOrderStore } from '@/stores/order';

const props = defineProps({
  storeId: {
    type: String,
    required: true
  }
});

// 使用 Pinia store
const orderStore = useOrderStore();

// 本地狀態
const selectedDate = ref('');
const filterType = ref('all');
const filterStatus = ref('all');
const orderDetailsModal = ref(null);

const key_value = {
  'linepay': 'Line pay'
}

// 初始化日期為今天
onMounted(() => {
  const today = new Date();
  selectedDate.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  // fetchOrders();

  // 初始化 Bootstrap Modal
  import('bootstrap/js/dist/modal').then(module => {
    const Modal = module.default;
    const modalElement = document.getElementById('orderDetailsModal');
    if (modalElement) {
      orderDetailsModal.value = new Modal(modalElement);
    }
  });
});

// 過濾訂單
const filteredOrders = computed(() => {
  let filtered = [...orderStore.todayOrders];

  // 過濾取餐方式
  if (filterType.value !== 'all') {
    filtered = filtered.filter(order => order.pickupMethod === filterType.value);
  }

  // 過濾訂單狀態
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(order => order.orderStatus === filterStatus.value);
  }

  // 按時間排序（最新的在前）
  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

// 查詢訂單
const fetchOrders = async () => {
  // console.log('!')
  await orderStore.fetchOrdersByDateRange(props.storeId, selectedDate.value);
};

// 選擇並查看訂單詳情（顯示在右側面板）
const selectAndViewOrder = async (order) => {
  try {
    // 獲取訂單的完整詳情
    const orderDetails = await orderStore.fetchOrderDetails(order._id);
    if (orderDetails) {
      // 設置選中的訂單，這會在右側面板顯示訂單詳情
      orderStore.selectOrder(orderDetails);
    }
  } catch (error) {
    console.error('獲取訂單詳情失敗:', error);
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

// 監聽日期變化
watch(selectedDate, () => {
  fetchOrders();
});

// onMounted(async () => {
//   await fetchOrders();
//   console.log(filteredOrders.value);
// }); 
</script>

<style scoped>
.component-header {
  position: sticky;
  top: 0;
  z-index: 100;
}

table {
  font-size: 0.9rem;
}

tr {
  cursor: pointer;
}

tr:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.badge {
  font-size: 0.95rem;
}

.order-row {
  height: 50px;
  vertical-align: middle;
}

.table-active {
  --bs-table-active-bg: rgba(83, 109, 254, 0.35) !important;
  /* 被選中行」的文字顏色 */
  --bs-table-active-color: #000 !important; 
  /* 當滑鼠懸停 (hover) 在表格行時，背景色變為 --bs-table-active-bg */
  --bs-table-hover-bg: var(--bs-table-active-bg) !important;
  /* 當滑鼠懸停 (hover) 在表格行時，文字顏色變為黑色 */
  --bs-table-hover-color: var(--bs-table-active-color) !important;
}
</style>