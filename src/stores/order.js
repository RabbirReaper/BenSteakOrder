import { defineStore } from 'pinia';
import api from '@/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useOrderStore = defineStore('order', {
  state: () => ({
    // 購物車狀態
    cart: [],
    currentItem: null,
    currentItemIndex: null,
    adjustment: 0,
    discount: 0,

    // 訂單狀態
    selectedOrder: null,
    todayOrders: [],

    // 菜單狀態
    menuData: {
      mainDishes: [],
      elseDishes: [],
      addons: []
    },

    // 組件狀態
    activeComponent: 'Orders',

    // 提交狀態
    isCheckingOut: false
  }),

  getters: {
    // 計算當前日期
    currentDate: () => {
      const now = new Date();
      return `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
    },

    // 計算子總額
    subtotal: (state) => {
      return state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // 計算總額
    total: (state) => {
      return state.subtotal + state.adjustment - state.discount;
    },

    // 今日日期上限
    maxDate: () => {
      const now = new Date();
      // 加上 8 小時的毫秒數來獲得 UTC+8 時間
      const utc8Date = new Date(now.getTime() + (8 * 60 * 60 * 1000));
      // 格式化為 YYYY-MM-DD
      return utc8Date.toISOString().split('T')[0];
    },

    // 獲取所有可加點的肉類
    additionalMeatDishes: (state) => {
      if (!state.menuData || !state.menuData.mainDishes) return [];

      // 返回 extraPrice != 0 的肉類單品
      return state.menuData.mainDishes.filter(dish => dish.extraPrice != 0);
    }
  },

  actions: {
    // ======= 購物車操作 =======

    // 直接添加菜品到購物車
    addDishToCart(dish, type) {
      // 創建新的購物車項目
      const newItem = {
        name: dish.name,
        price: dish.price,
        itemModel: type,
        id: dish._id,
        quantity: 1,
        doneness: dish.category === 'Steak' && dish.steakDoneness ? dish.steakDoneness[0] : '',
        sauce: dish.sauceOptions && dish.sauceOptions.length ? '蘑菇醬' : '',
        addons: [],
        additionalMeats: [],
        extraOptions: [],
        remarks: ''
      };

      // 添加到購物車
      this.cart.push(newItem);

      // 設置當前項目為新添加的項目
      this.currentItem = { ...newItem };
      this.currentItemIndex = this.cart.length - 1;
    },

    // 添加到購物車
    // addToCart(item) {
    //   if (this.currentItemIndex !== null) {
    //     // 更新現有項目
    //     this.cart[this.currentItemIndex] = { ...item };
    //   } else {
    //     // 添加新項目
    //     this.cart.push({ ...item });
    //   }
    //   // 重置當前項目和索引
    //   this.resetCurrentItem();
    // },

    // 從購物車中移除項目
    removeFromCart(index) {
      this.cart.splice(index, 1);

      // 如果刪除的是當前正在編輯的項目，重置當前項目
      if (this.currentItemIndex === index) {
        this.resetCurrentItem();
      } else if (this.currentItemIndex > index) {
        // 如果刪除的項目在當前編輯項目之前，需要調整索引
        this.currentItemIndex--;
      }
    },

    // 更新購物車中項目的數量
    updateQuantity(index, change) {
      const newQuantity = this.cart[index].quantity + change;

      if (newQuantity > 0) {
        this.cart[index].quantity = newQuantity;
      } else if (newQuantity <= 0) {
        this.removeFromCart(index);
      }
    },

    // 選擇當前項目進行編輯
    selectCurrentItem(item, index) {
      this.currentItem = item ? { ...item } : null;
      this.currentItemIndex = index;

      // 如果選擇了項目進行編輯，立即在購物車中創建臨時版本
      if (index !== null) {
        // 創建原始副本用於參考
        this.cart[index] = { ...item };
      }
    },

    // 重置當前項目
    resetCurrentItem() {
      this.currentItem = null;
      this.currentItemIndex = null;
    },

    // 清空購物車
    clearCart() {
      this.currentItem = null;
      this.currentItemIndex = null;
      this.cart = [];
      this.adjustment = 0;
      this.discount = 0;
      // 同時清除選中的訂單
      this.selectedOrder = null;
    },

    // ======= 菜品選擇操作 =======

    // 選擇菜品
    selectDish(dish, type) {
      // 創建新的當前項目
      this.currentItem = {
        name: dish.name,
        price: dish.price,
        itemModel: type,
        id: dish._id,
        quantity: 1,
        doneness: dish.category === 'Steak' && dish.steakDoneness ? dish.steakDoneness[0] : '',
        sauce: dish.sauceOptions && dish.sauceOptions.length ? '不加醬' : '',
        addons: [],
        additionalMeats: [],
        extraOptions: [],
        remarks: ''
      };
      this.currentItemIndex = null;
    },

    // 選擇熟度
    selectDoneness(doneness) {
      if (this.currentItem) {
        this.currentItem.doneness = doneness;
        this.syncCurrentItemToCart();
      }
    },

    // 選擇醬料
    selectSauce(sauce) {
      if (this.currentItem) {
        this.currentItem.sauce = sauce;
        this.syncCurrentItemToCart();
      }
    },

    // 切換額外選項
    toggleExtraOption(option) {
      if (!this.currentItem) return;

      const index = this.currentItem.extraOptions.indexOf(option);
      if (index > -1) {
        this.currentItem.extraOptions.splice(index, 1);
      } else {
        this.currentItem.extraOptions.push(option);
      }
      this.syncCurrentItemToCart();
    },

    // 檢查額外選項是否已選擇
    isExtraOptionSelected(option) {
      return this.currentItem && this.currentItem.extraOptions.includes(option);
    },

    // 選擇加點
    toggleAddon(addon) {
      if (!this.currentItem) return;

      const index = this.currentItem.addons.findIndex(a => a._id === addon._id);
      if (index > -1) {
        // 移除加點並扣除價格
        this.currentItem.addons.splice(index, 1);
        this.currentItem.price -= addon.price;
      } else {
        // 添加加點並增加價格
        this.currentItem.addons.push(addon);
        this.currentItem.price += addon.price;
      }
      this.syncCurrentItemToCart();
    },

    // 檢查加點是否已選擇
    isAddonSelected(addon) {
      return this.currentItem && this.currentItem.addons.some(a => a._id === addon._id);
    },

    // 選擇其他肉類單品
    toggleAdditionalMeat(meat) {
      if (!this.currentItem) return;

      const index = this.currentItem.additionalMeats.findIndex(m => m._id === meat._id);
      if (index > -1) {
        // 移除肉類並扣除額外價格
        this.currentItem.additionalMeats.splice(index, 1);
        this.currentItem.price -= meat.extraPrice;
      } else {
        // 添加肉類並增加額外價格
        this.currentItem.additionalMeats.push(meat);
        this.currentItem.price += meat.extraPrice;
      }
      this.syncCurrentItemToCart();
    },

    // 檢查其他肉類單品是否已選擇
    isAdditionalMeatSelected(meat) {
      return this.currentItem && this.currentItem.additionalMeats.some(m => m._id === meat._id);
    },

    // 即時同步當前項目到購物車
    syncCurrentItemToCart() {
      if (this.currentItemIndex !== null && this.currentItem) {
        // 直接更新購物車中的項目
        this.cart[this.currentItemIndex] = { ...this.currentItem };
      }
    },

    // 設置調整金額
    setAdjustment(value) {
      this.adjustment = value;
    },

    // 設置折扣金額
    setDiscount(value) {
      this.discount = value;
    },

    // ======= 訂單操作 =======

    // 設置活動組件
    setActiveComponent(component) {
      // 先記錄之前的組件
      const prevComponent = this.activeComponent;

      // 更新當前活動組件
      this.activeComponent = component;

      // 切換到訂單頁面時清空購物車
      if (component === 'Orders') {
        this.clearCart();
      }
      // 如果從訂單頁面切換到其他頁面，也清空購物車和選中訂單
      else if (prevComponent === 'Orders') {
        this.clearCart();
      }
      // 如果在非訂單頁面之間切換，且有選中訂單，則載入訂單到購物車
      // 這部分可以移除，除非你確實需要在切換非訂單頁面時載入選中訂單
      // else if (this.selectedOrder) {
      //   this.loadOrderToCart(this.selectedOrder);
      // }
    },

    // 從訂單加載項目到購物車
    loadOrderToCart(order) {
      this.clearCart();
      if (!order || !order.items) return;

      order.items.forEach(item => {
        // 轉換訂單項目格式為購物車項目格式
        const cartItem = {
          id: item.itemId._id,
          itemModel: item.itemModel,
          name: item.itemId.name,
          price: item.thisMoney / item.amount,
          quantity: item.amount,
          doneness: item.options?.doneness || null,
          sauce: item.options?.sauce || null,
          addons: item.options?.addons || [],
          additionalMeats: item.options?.additionalMeats || [],
          extraOptions: item.options?.extraOptions || [],
          remarks: item.options?.remarks || ''
        };
        this.cart.push(cartItem);
      });

      // 設置訂單的調整和折扣
      this.adjustment = order.discounts || 0;
      this.discount = order.pointsDiscount || 0;
    },

    // 選擇一個訂單
    selectOrder(order) {
      this.selectedOrder = order;
      if (this.activeComponent === 'Orders') {
        // 只顯示訂單詳情，不加載到購物車
      } else {
        // 其他頁面則加載訂單到購物車
        this.loadOrderToCart(order);
      }
    },

    // 取消訂單
    cancelOrder() {
      if (confirm('確定要取消此訂單嗎？')) {
        this.clearCart();
        this.selectedOrder = null;
      }
    },

    // 結帳
    async checkout(storeId, pickupMethod) {
      if (this.cart.length === 0) return;
      if(this.isCheckingOut) return;
      this.isCheckingOut = true;

      try {
        // 整理購物車項目
        const orderItems = this.cart.map(item => ({
          itemModel: item.itemModel,
          itemId: item.id,
          amount: item.quantity,
          options: {
            doneness: item.doneness,
            sauce: item.sauce,
            addons: item.addons.map(a => a._id || a),
            extraOptions: item.extraOptions,
            additionalMeats: item.additionalMeats?.map(m => m._id || m) || [],
            remarks: item.remarks,
          },
          thisMoney: item.price * item.quantity
        }));

        // 生成訂單號碼
        const orderNumberRes = await api.order.getOrderNumber();
        const orderNumber = orderNumberRes.data.number;

        // 創建訂單數據
        const orderData = {
          store: storeId,
          orderNumber: String(orderNumber),
          platform: 'pos',
          pickupMethod: pickupMethod || this.activeComponent === 'DineIn' ? '內用' : '自取',
          paymentMethod: '現金', // 預設為現金
          orderAmount: this.subtotal,
          discounts: this.adjustment,
          pointsDiscount: this.discount,
          totalMoney: this.total,
          tableNumber: this.activeComponent === 'DineIn' ? 0 : null,
          items: orderItems,
          remarks: null,
        };

        // 創建新訂單
        const { data: newOrder } = await api.order.create(orderData);
        // alert(`訂單建立成功，訂單編號: ${orderNumber}`);

        // 清空購物車
        this.clearCart();

        // 刷新訂單列表
        await this.fetchTodayOrders(storeId);

        // 切換到訂單頁面
        this.setActiveComponent('Orders');
        this.isCheckingOut = false;
        return newOrder;
      } catch (error) {
        console.error('結帳失敗:', error);
        alert('結帳失敗，請重試');
        return null;
      }
    },

    // ======= 數據獲取 =======

    // 獲取菜單數據
    async fetchMenuData() {
      try {
        // 獲取主餐
        const mainDishesRes = await api.dish.getAll('mainDish');
        this.menuData.mainDishes = mainDishesRes.data;

        // 獲取附餐
        const elseDishesRes = await api.dish.getAll('elseDish');
        this.menuData.elseDishes = elseDishesRes.data;

        // 獲取加點配料
        const addonsRes = await api.dish.getAll('addon');
        this.menuData.addons = addonsRes.data;
      } catch (error) {
        console.error("獲取菜單數據失敗:", error);
      }
    },

    // 獲取今日訂單
    async fetchTodayOrders(storeId) {
      try {
        const response = await api.order.getTodayStoreOrders(storeId);
        this.todayOrders = response.data;
      } catch (error) {
        console.error("獲取今日訂單失敗:", error);
      }
    },

    // 按日期範圍獲取訂單
    async fetchOrdersByDateRange(storeId, selectedDate) {
      try {
        // 創建日期範圍
        const start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);

        // 使用 query 參數
        const response = await api.order.getStoreOrdersByTimeRange(storeId, start, end);

        this.todayOrders = response.data;
      } catch (error) {
        console.error('獲取訂單失敗:', error);
      }
    },

    // 獲取訂單詳情
    async fetchOrderDetails(orderId) {
      try {
        // 直接從本地數據中查找訂單，而不是發送 API 請求
        const foundOrder = this.todayOrders.find(order => order._id === orderId);

        if (foundOrder) {
          return foundOrder;
        } else {
          console.error('訂單在本地數據中找不到:', orderId);
          return null;
        }
      } catch (error) {
        console.error('獲取訂單詳情失敗:', error);
        return null;
      }
    },

    // 更新訂單狀態
    async updateOrderStatus(orderId, status) {
      if (!confirm(`確定要將訂單狀態更新為${this.formatStatus(status)}嗎？`)) {
        return false;
      }

      try {
        await api.order.updateStatus(orderId, status);

        // 更新本地數據
        this.todayOrders = this.todayOrders.map(order => {
          if (order._id === orderId) {
            return { ...order, orderStatus: status };
          }
          return order;
        });

        if (this.selectedOrder && this.selectedOrder._id === orderId) {
          this.selectedOrder.orderStatus = status;
        }

        return true;
      } catch (error) {
        console.error('更新訂單狀態失敗:', error);
        return false;
      }
    },

    // ======= 工具函數 =======

    // 格式化日期時間
    formatDateTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('zh-TW');
    },

    // 格式化時間
    formatTime(dateString) {
      const date = new Date(dateString);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },

    // 格式化狀態
    formatStatus(status) {
      switch (status) {
        case 'Completed':
          return '已完成';
        case 'Canceled':
          return '已取消';
        case 'Unpaid':
          return '未結帳';
        default:
          return status;
      }
    },

    // 獲取取餐方式的樣式類
    getPickupMethodClass(method) {
      switch (method) {
        case '內用':
          return 'badge bg-primary';
        case '自取':
          return 'badge bg-success';
        case '外送':
          return 'badge bg-warning text-dark';
        default:
          return 'badge bg-secondary';
      }
    },

    // 獲取狀態的樣式類
    getStatusClass(status) {
      switch (status) {
        case 'Completed':
          return 'badge bg-success';
        case 'Canceled':
          return 'badge bg-danger';
        case 'Unpaid':
          return 'badge bg-warning text-dark';
        default:
          return 'badge bg-secondary';
      }
    },

    // 格式化加點配料
    formatAddons(addons) {
      if (!addons || addons.length === 0) return '';

      return addons.map(addon => {
        if (typeof addon === 'object' && addon !== null) {
          return addon.name || "未知加點";
        }
        return "加點項目";
      }).join(', ');
    },

    // 格式化額外肉品
    formatAdditionalMeats(meats) {
      if (!meats || meats.length === 0) return '';

      return meats.map(meat => {
        if (typeof meat === 'object' && meat !== null) {
          return meat.name || "未知肉品";
        }
        return "肉品項目";
      }).join(', ');
    },

    // 獲取餐點名稱
    getItemName(item) {
      if (!item || !item.itemId) return "未知餐點";

      return item.itemId.name
    },

    // 計算總價格
    calculateTotalPrice(dish, addons, additionalMeats) {
      let totalPrice = dish.price;

      // 加上所有配料的價格
      if (addons && addons.length) {
        addons.forEach(addon => {
          if (addon && addon.price) {
            totalPrice += addon.price;
          }
        });
      }

      // 加上所有額外肉類的價格
      if (additionalMeats && additionalMeats.length) {
        additionalMeats.forEach(meat => {
          if (meat && meat.extraPrice) {
            totalPrice += meat.extraPrice;
          }
        });
      }

      return totalPrice;
    },

    // 重新整理所有數據
    async refreshData(storeId) {
      await this.fetchMenuData();
      await this.fetchTodayOrders(storeId);
    }
  }
});