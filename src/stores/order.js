// src/stores/order.js
import { defineStore } from 'pinia';
import api from '@/api';

export const useOrderStore = defineStore('order', {
  state: () => ({
    activeComponent: 'DineIn', // DineIn, TakeOut, Orders
    
    // 菜單數據
    menuData: {
      mainDishes: [],
      elseDishes: [],
      addons: [],
      rawMeat: [],
      menuStructure: null,
    },
    
    // 購物車
    cart: [],
    currentItem: null,
    currentItemIndex: null,
    adjustment: 0, // 調帳金額 (正數為減少, 負數為增加)
    discount: 0, // 折扣金額
    tableNumber: '', // 桌號 (內用才需要)
    remarks: '', // 備註
    deliveryAddress: '', // 外送地址 (外送才需要)
    isCheckingOut: false, // 是否正在結帳
    
    // 訂單管理
    todayOrders: [],
    selectedOrder: null,
    currentDate: null,
    maxDate: null, // 最大可選日期 (今天)
  }),
  
  getters: {
    // 購物車小計
    subtotal: (state) => {
      return state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    // 購物車總計
    total: (state) => {
      return Math.max(0, state.subtotal - state.adjustment - state.discount);
    },
    
    // 取得可以加點的肉類
    additionalMeatDishes: (state) => {
      return state.menuData.mainDishes.filter(dish => 
        dish.extraPrice !== 0
      );
    }
  },
  
  actions: {
    // 設置活動組件
    setActiveComponent(component) {
      this.activeComponent = component;
      
      // 如果切換到新組件，重置選中的訂單
      if (component !== 'Orders') {
        this.selectedOrder = null;
      }
    },
    
    // 初始化菜單數據結構
    initMenuData(menu) {
      this.menuData.menuStructure = menu;
    },
    
    // 設置詳細的餐點數據
    setDishesData(dishes) {
      this.menuData.mainDishes = dishes.mainDishes;
      this.menuData.elseDishes = dishes.elseDishes;
      this.menuData.addons = dishes.addons;
      this.menuData.rawMeat = dishes.rawMeat;
    },

    // 添加餐點到購物車
    addDishToCart(dish, type) {
      // 創建新項目
      const newItem = {
        id: dish._id,
        itemModel: type,
        name: dish.name,
        price: dish.price,
        quantity: 1,
        doneness: dish.category === 'Steak' ? dish.steakDoneness[0] : null,
        sauce: dish.sauceOptions && dish.sauceOptions.length > 0 ? dish.sauceOptions[0] : null,
        addons: [],
        additionalMeats: [],
        extraOptions: [],
        remarks: ''
      };
      
      // 設置當前編輯項目
      this.currentItem = { ...newItem };
      this.currentItemIndex = this.cart.length;
      
      // 添加到購物車
      this.cart.push(newItem);
    },
    
    // 從購物車中移除項目
    removeFromCart(index) {
      this.cart.splice(index, 1);
      
      // 如果刪除的是當前編輯項目，清除當前編輯狀態
      if (this.currentItemIndex === index) {
        this.clearCurrentItem();
      } else if (this.currentItemIndex > index) {
        // 調整索引
        this.currentItemIndex--;
      }
    },
    
    // 更新購物車中項目的數量
    updateQuantity(index, change) {
      const newQuantity = this.cart[index].quantity + change;
      if (newQuantity > 0) {
        this.cart[index].quantity = newQuantity;
        
        // 如果正在編輯此項目，同步更新當前項目
        if (this.currentItemIndex === index && this.currentItem) {
          this.currentItem.quantity = newQuantity;
        }
      }
    },
    
    // 選擇當前編輯的項目
    selectCurrentItem(item, index) {
      this.currentItem = { ...item };
      this.currentItemIndex = index;
    },
    
    // 清除當前編輯的項目
    clearCurrentItem() {
      this.currentItem = null;
      this.currentItemIndex = null;
    },

    // 設置熟度
    selectDoneness(doneness) {
      if (this.currentItem) {
        this.currentItem.doneness = doneness;
        
        // 同步更新購物車中的項目
        if (this.currentItemIndex !== null) {
          this.cart[this.currentItemIndex].doneness = doneness;
        }
      }
    },
    
    // 設置醬料
    selectSauce(sauce) {
      if (this.currentItem) {
        this.currentItem.sauce = sauce;
        
        // 同步更新購物車中的項目
        if (this.currentItemIndex !== null) {
          this.cart[this.currentItemIndex].sauce = sauce;
        }
      }
    },
    
    // 切換額外選項
    toggleExtraOption(option) {
      if (this.currentItem) {
        const options = [...(this.currentItem.extraOptions || [])];
        const index = options.indexOf(option);
        
        if (index === -1) {
          options.push(option);
        } else {
          options.splice(index, 1);
        }
        
        this.currentItem.extraOptions = options;
        
        // 同步更新購物車中的項目
        if (this.currentItemIndex !== null) {
          this.cart[this.currentItemIndex].extraOptions = [...options];
        }
      }
    },
    
    // 檢查額外選項是否已選擇
    isExtraOptionSelected(option) {
      return this.currentItem && 
             this.currentItem.extraOptions && 
             this.currentItem.extraOptions.includes(option);
    },
    
    // 切換加點配料
    toggleAddon(addon) {
      if (this.currentItem) {
        const addons = [...(this.currentItem.addons || [])];
        const index = addons.findIndex(item => item._id === addon._id);
        
        if (index === -1) {
          addons.push(addon);
        } else {
          addons.splice(index, 1);
        }
        
        this.currentItem.addons = addons;
        
        // 更新價格
        this.updateItemPrice();
        
        // 同步更新購物車中的項目
        if (this.currentItemIndex !== null) {
          this.cart[this.currentItemIndex].addons = [...addons];
          this.cart[this.currentItemIndex].price = this.currentItem.price;
        }
      }
    },
    
    // 檢查加點配料是否已選擇
    isAddonSelected(addon) {
      return this.currentItem && 
             this.currentItem.addons && 
             this.currentItem.addons.some(item => item._id === addon._id);
    },
    
    // 切換加點肉品
    toggleAdditionalMeat(meat) {
      if (this.currentItem) {
        const meats = [...(this.currentItem.additionalMeats || [])];
        const index = meats.findIndex(item => item._id === meat._id);
        
        if (index === -1) {
          meats.push(meat);
        } else {
          meats.splice(index, 1);
        }
        
        this.currentItem.additionalMeats = meats;
        
        // 更新價格
        this.updateItemPrice();
        
        // 同步更新購物車中的項目
        if (this.currentItemIndex !== null) {
          this.cart[this.currentItemIndex].additionalMeats = [...meats];
          this.cart[this.currentItemIndex].price = this.currentItem.price;
        }
      }
    },
    
    // 檢查加點肉品是否已選擇
    isAdditionalMeatSelected(meat) {
      return this.currentItem && 
             this.currentItem.additionalMeats && 
             this.currentItem.additionalMeats.some(item => item._id === meat._id);
    },
    
    // 更新項目價格 (包括加料和額外肉品)
    updateItemPrice() {
      if (this.currentItem && this.currentItemIndex !== null) {
        const baseItem = this.currentItem.itemModel === 'MainDish' 
          ? this.menuData.mainDishes.find(d => d._id === this.currentItem.id)
          : this.menuData.elseDishes.find(d => d._id === this.currentItem.id);
          
        if (!baseItem) return;
        
        // 基本價格
        let price = baseItem.price;
        
        // 加點配料價格
        if (this.currentItem.addons && this.currentItem.addons.length) {
          price += this.currentItem.addons.reduce((sum, addon) => sum + addon.price, 0);
        }
        
        // 加點肉品價格
        if (this.currentItem.additionalMeats && this.currentItem.additionalMeats.length) {
          price += this.currentItem.additionalMeats.reduce((sum, meat) => sum + meat.extraPrice, 0);
        }
        
        this.currentItem.price = price;
      }
    },
    
    // 設置調帳金額
    setAdjustment(amount) {
      this.adjustment = amount;
    },
    
    // 設置折扣金額
    setDiscount(amount) {
      this.discount = amount;
    },
    
    // 設置桌號
    setTableNumber(number) {
      this.tableNumber = number;
    },
    
    // 設置備註
    setRemarks(remarks) {
      this.remarks = remarks;
    },
    
    // 設置外送地址
    setDeliveryAddress(address) {
      this.deliveryAddress = address;
    },
    
    // 取消訂單 (清空購物車)
    cancelOrder() {
      // 確認是否要取消
      if (this.cart.length > 0) {
        if (confirm('確定要取消訂單嗎？')) {
          this.cart = [];
          this.currentItem = null;
          this.currentItemIndex = null;
          this.adjustment = 0;
          this.discount = 0;
          this.tableNumber = '';
          this.remarks = '';
          this.deliveryAddress = '';
        }
      }
    },
    
    // 結帳
    async checkout(storeId) {
      if (this.cart.length === 0 || this.isCheckingOut) return;
      
      this.isCheckingOut = true;
      
      try {
        // 獲取訂單編號
        const numberResponse = await api.order.getOrderNumber();
        
        if (!numberResponse.data.success) {
          throw new Error(numberResponse.data.message || '獲取訂單編號失敗');
        }
        
        const orderNumber = String(numberResponse.data.number);
        
        // 准備訂單數據
        const orderItems = this.cart.map(item => ({
          itemModel: item.itemModel,
          itemId: item.id,
          amount: item.quantity,
          options: {
            doneness: item.doneness,
            sauce: item.sauce,
            addons: item.addons.map(addon => addon._id),
            extraOptions: item.extraOptions,
            additionalMeats: item.additionalMeats.map(meat => meat._id),
            remarks: item.remarks
          },
          thisMoney: item.price * item.quantity
        }));
        
        // 決定取餐方式
        let pickupMethod = '自取'; // 默認為自取
        if (this.activeComponent === 'DineIn') {
          pickupMethod = '內用';
        }
        
        // 創建訂單
        const orderData = {
          store: storeId,
          orderNumber,
          platform: 'POS',
          pickupMethod,
          paymentMethod: '現金', // 默認為現金
          orderAmount: this.subtotal,
          discounts: this.adjustment,
          pointsDiscount: this.discount,
          totalMoney: this.total,
          orderStatus: 'Unpaid',
          tableNumber: pickupMethod === '內用' ? this.tableNumber|0 : undefined,
          remarks: this.remarks,
          deliveryAddress: pickupMethod === '外送' ? this.deliveryAddress : 0,
          items: orderItems
        };
        
        const response = await api.order.create(orderData);
        
        if (!response.data.success) {
          throw new Error(response.data.message || '創建訂單失敗');
        }
        
        // 創建成功，清空購物車
        this.cart = [];
        this.currentItem = null;
        this.currentItemIndex = null;
        this.adjustment = 0;
        this.discount = 0;
        this.tableNumber = '';
        this.remarks = '';
        this.deliveryAddress = '';
        
        // 更新今日訂單列表
        await this.fetchTodayOrders(storeId);
        
        // 成功提示
        // alert(`訂單 #${orderNumber} 已成功建立!`);
      } catch (error) {
        console.error('結帳失敗:', error);
        
        let errorMsg = '結帳失敗，請稍後再試';
        
        if (error.response) {
          // 伺服器有回應但狀態碼不是 2xx
          errorMsg = error.response.data.message || '伺服器錯誤，請稍後再試';
        } else if (error.request) {
          // 沒有收到伺服器回應
          errorMsg = '無法連線到伺服器，請檢查網絡連接';
        } else {
          // 其他錯誤
          errorMsg = error.message || '發生未知錯誤';
        }
        
        // alert(errorMsg);
        throw error; // 將錯誤向上拋出，以便調用者可以處理
      } finally {
        this.isCheckingOut = false;
      }
    },
    
    // 獲取今日訂單列表
    async fetchTodayOrders(storeId) {
      try {
        const response = await api.order.getTodayStoreOrders(storeId);
        
        if (!response.data.success) {
          throw new Error(response.data.message || '獲取訂單失敗');
        }
        
        this.todayOrders = response.data.orders;
        
        // 設置當前日期
        const today = new Date();
        this.maxDate = today.toISOString().split('T')[0];
        this.currentDate = this.formatDate(today);
      } catch (error) {
        console.error('獲取今日訂單失敗:', error);
        throw error;
      }
    },
    
    // 獲取單個訂單詳情
    async fetchOrderDetails(orderId) {
      try {
        const response = await api.order.getById(orderId);
        
        if (!response.data.success) {
          throw new Error(response.data.message || '獲取訂單詳情失敗');
        }
        
        return response.data.order;
      } catch (error) {
        console.error('獲取訂單詳情失敗:', error);
        throw error;
      }
    },
    
    // 選擇訂單（在訂單管理頁面顯示）
    selectOrder(order) {
      this.selectedOrder = order;
    },
    
    // 刷新所有數據
    async refreshData(storeId) {
      try {
        // 重新獲取菜單數據
        const storeResponse = await api.store.getById(storeId);
        
        if (!storeResponse.data.success) {
          throw new Error(storeResponse.data.message || '獲取店家資訊失敗');
        }
        
        const store = storeResponse.data.store;
        
        // 獲取菜單細節
        const menuResponse = await api.menu.getById(store.menuItem);
        
        if (!menuResponse.data.success) {
          throw new Error(menuResponse.data.message || '獲取菜單資訊失敗');
        }
        
        // 初始化菜單數據
        this.initMenuData(menuResponse.data.menu, store);
        
        // 加載餐點詳細資料
        await this.fetchDishData();
        
        // 更新今日訂單
        await this.fetchTodayOrders(storeId);
        
        // 提示刷新成功
        // alert('數據已成功更新！');
      } catch (error) {
        console.error('刷新數據失敗:', error);
        
        let errorMsg = '刷新數據失敗';
        
        if (error.response) {
          errorMsg = error.response.data.message || '伺服器錯誤';
        } else if (error.request) {
          errorMsg = '無法連線到伺服器';
        } else {
          errorMsg = error.message || '發生未知錯誤';
        }
        
        // alert(errorMsg);
        throw error;
      }
    },
    
    // 加載所有菜單相關數據
    async fetchMenuData() {
      try {
        // 先檢查是否已有數據
        if (this.menuData.mainDishes.length > 0) return;
        
        await this.fetchDishData();
      } catch (error) {
        console.error('獲取菜單數據失敗:', error);
        throw error;
      }
    },
    
    // 獲取所有餐點數據
    async fetchDishData() {
      try {
        // 加載主餐資料
        const mainDishesPromise = api.dish.getAll('mainDish');
        // 加載附餐資料
        const elseDishesPromise = api.dish.getAll('elseDish');
        // 加載配料資料
        const addonsPromise = api.dish.getAll('addon');
        // 加載生肉資料
        const rawMeatPromise = api.dish.getAll('rawMeat');
        
        // 平行處理所有請求
        const [mainDishesRes, elseDishesRes, addonsRes, rawMeatRes] = await Promise.all([
          mainDishesPromise,
          elseDishesPromise,
          addonsPromise,
          rawMeatPromise
        ]);
        
        // 檢查回應是否成功
        if (!mainDishesRes.data.success || !elseDishesRes.data.success || 
            !addonsRes.data.success || !rawMeatRes.data.success) {
          throw new Error('獲取餐點詳細資料失敗');
        }
        
        // 更新 store 中的餐點詳細資料
        this.setDishesData({
          mainDishes: mainDishesRes.data.dishes,
          elseDishes: elseDishesRes.data.dishes,
          addons: addonsRes.data.dishes,
          rawMeat: rawMeatRes.data.dishes
        });
      } catch (error) {
        console.error('獲取餐點數據失敗:', error);
        throw error;
      }
    },
    
    // 設置當前日期 (顯示用)
    setCurrentDate(date) {
      if (date) {
        const formattedDate = this.formatDate(new Date(date));
        this.currentDate = formattedDate;
      }
    },
    
    // 設置今日訂單
    setTodayOrders(orders) {
      this.todayOrders = orders;
    },
    
    // 格式化日期 (YYYY-MM-DD)
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    
    // 格式化時間 (HH:MM)
    formatTime(dateString) {
      const date = new Date(dateString);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    
    // 格式化日期時間 (YYYY-MM-DD HH:MM)
    formatDateTime(dateString) {
      const date = new Date(dateString);
      const formattedDate = this.formatDate(date);
      const formattedTime = this.formatTime(dateString);
      return `${formattedDate} ${formattedTime}`;
    },
    
    // 格式化訂單狀態
    formatStatus(status) {
      const statusMap = {
        'Unpaid': '未結帳',
        'Completed': '已完成',
        'Canceled': '已取消'
      };
      return statusMap[status] || status;
    },
    
    // 取得訂單狀態樣式類
    getStatusClass(status) {
      const classMap = {
        'Unpaid': 'badge bg-warning',
        'Completed': 'badge bg-success',
        'Canceled': 'badge bg-danger'
      };
      return classMap[status] || 'badge bg-secondary';
    },
    
    // 取得取餐方式樣式類
    getPickupMethodClass(method) {
      const classMap = {
        '內用': 'badge bg-primary',
        '自取': 'badge bg-success',
        '外送': 'badge bg-info text-dark'
      };
      return classMap[method] || 'badge bg-secondary';
    },
    
    // 格式化加點配料
    formatAddons(addons) {
      if (!addons || !addons.length) return '';
      return addons.map(addon => addon.name || "未知加點").join(', ');
    },
    
    // 格式化額外肉品
    formatAdditionalMeats(meats) {
      if (!meats || !meats.length) return '';
      return meats.map(meat => meat.name || "未知肉品").join(', ');
    },
    
    // 獲取項目名稱 (用於訂單詳情顯示)
    getItemName(item) {
      if (item && item.itemId) {
        return item.itemId.name || "未知項目";
      }
      return "未知項目";
    }
  }
});