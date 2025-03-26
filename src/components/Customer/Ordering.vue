<template>
  <div class="main-container">
    <div class="center-container">
      <transition name="fade" mode="out-in">
        <MenuListing 
          v-if="!selectedItem && !showCart" 
          :store-name="store.name" 
          :announcements="store.announcements"
          :menu-list="menu.list" 
          :menu-items="menuItems" 
          :store-image="store.image" 
          @select-item="openItemDetails"
          :is-logged-in="isLoggedIn"
          :customer-name="customerName"
          @login="goToLogin"
          @account="goToAccount"
        />
      </transition>

      <transition name="fade" mode="out-in">
        <ItemDetail 
          v-if="selectedItem && !showCart" 
          :item="selectedItem" 
          :addon-items="addonItems"
          :menu-items="menuItems" 
          @close="closeItemDetails" 
          @add-to-cart="addToCart" 
        />
      </transition>

      <transition name="fade" mode="out-in">
        <ShoppingCart 
          v-if="showCart" 
          :cart="cart" 
          :order-type="orderType" 
          :store-id="storeId"
          :remove-from-cart="removeFromCart" 
          :update-cart-item-quantity="updateCartItemQuantity"
          @go-back="showCart = false" 
          @edit-item="editCartItem" 
          @order-submitted="handleOrderSubmitted" 
        />
      </transition>

      <!-- Shopping Cart Button -->
      <div v-if="cart.length > 0 && !selectedItem && !showCart"
        class="position-fixed bottom-0 start-50 translate-middle-x mb-4" style="z-index: 1030;">
        <button class="btn btn-primary rounded-pill shadow px-4 py-2" @click="showCart = true">
          <i class="bi bi-cart-fill me-2"></i>
          {{ getTotalItems() }} 項商品 - ${{ calculateTotal() }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';
import MenuListing from '@/components/Customer/Main.vue';
import ItemDetail from '@/components/Customer/ItemDetail.vue';
import ShoppingCart from '@/components/Customer/ShoppingCart.vue';

const route = useRoute();
const router = useRouter();
const storeId = route.params.store_id;
const queryOrderType = route.query.orderType;
const queryTable = route.query.table;

// 狀態
const store = ref({});
const menu = ref({});
const menuItems = ref([]);
const addonItems = ref([]);
const orderType = ref(queryOrderType || 'dineIn');
const tableNumber = ref(queryTable || '0');
const selectedItem = ref(null);
const cart = ref([]);
const showCart = ref(false);
const errorMessage = ref('');

// 用戶狀態
const isLoggedIn = computed(() => {
  return localStorage.getItem('isLoggedIn') === 'true';
});

const customerName = computed(() => {
  return localStorage.getItem('customerName') || '';
});

// 跳轉到登入頁面
const goToLogin = () => {
  router.push(`/customer/login?store_id=${storeId}`);
};

// 跳轉到會員中心
const goToAccount = () => {
  router.push('/customer/my-account');
};

// 獲取店家資訊
const fetchStore = async () => {
  try {
    const response = await api.store.getById(storeId);
    
    if (response.data.success) {
      store.value = response.data.store;
    } else {
      errorMessage.value = response.data.message || '獲取店家資訊失敗，請稍後再試。';
      console.error('Error fetching store:', errorMessage.value);
    }
  } catch (error) {
    console.error('Error fetching store:', error);
    if (error.response) {
      errorMessage.value = error.response.data.message || '獲取店家資訊失敗，請稍後再試。';
    } else if (error.request) {
      errorMessage.value = '無法連線到伺服器，請檢查您的網路連接。';
    } else {
      errorMessage.value = '獲取店家資訊失敗，請稍後再試。';
    }
    router.push('/');
  }
};

// 獲取菜單資訊
const fetchMenu = async () => {
  try {
    menu.value = store.value.menuItem;
    
    // 創建一個映射，從 itemId 到 itemModel
    const dishModelMapping = {};
    
    // 創建一個集合，用於追踪已處理的 itemId
    const processedItemIds = new Set();
    
    // 收集所有需要請求的項目
    const itemsToFetch = [];
    
    if (menu.value && menu.value.list) {
      menu.value.list.forEach(category => {
        category.items.forEach(item => {
          const itemId = item.itemId;
          const itemModel = item.itemModel;
          
          // 更新映射
          dishModelMapping[itemId] = itemModel;
          
          // 只有未處理過的 itemId 才添加到請求列表
          if (!processedItemIds.has(itemId)) {
            processedItemIds.add(itemId);
            
            const endpoint = `${itemModel.charAt(0).toLowerCase() + itemModel.slice(1)}`;
            itemsToFetch.push({
              id: itemId,
              model: itemModel,
              endpoint: endpoint
            });
          }
        });
      });
    }
    
    // 發送所有請求
    const itemPromises = itemsToFetch.map(item => 
      api.dish.getById(item.endpoint, item.id)
      .then(response => {
        if (response.data.success) {
          return {
            ...response.data.dish,
            itemModel: item.model
          };
        } else {
          throw new Error(response.data.message || `獲取菜單項目 ${item.id} 失敗`);
        }
      })
    );
    
    // 等待所有請求完成
    const itemResponses = await Promise.all(itemPromises);
    menuItems.value = itemResponses;

    // 獲取加點配料
    try {
      const response = await api.dish.getAll('addon');
      if (response.data.success) {
        addonItems.value = response.data.dishes;
      } else {
        throw new Error(response.data.message || '獲取加點配料失敗');
      }
    } catch (error) {
      console.error('Error fetching addons:', error);
      addonItems.value = [];
    }
  } catch (error) {
    console.error('Error fetching menu items:', error);
    menuItems.value = [];
  }
};

// 處理菜單項選擇
const openItemDetails = (item) => {
  selectedItem.value = item;
};

const closeItemDetails = () => {
  selectedItem.value = null;
};

const addToCart = (item) => {
  cart.value.push(item);
};

const updateCartItemQuantity = (index, change) => {
  const newQuantity = cart.value[index].quantity + change;
  if (newQuantity > 0) {
    cart.value[index].quantity = newQuantity;
  } else {
    removeFromCart(index);
  }
};

const removeFromCart = (index) => {
  cart.value.splice(index, 1);

  // If cart is empty, go back to menu
  if (cart.value.length === 0) {
    showCart.value = false;
  }
};

const editCartItem = (index) => {
  const item = menuItems.value.find(menuItem => menuItem._id === cart.value[index].id);
  if (item) {
    // Remove the item from cart first
    const itemToEdit = cart.value[index];
    removeFromCart(index);

    // Open the item detail with pre-filled selections
    selectedItem.value = {
      ...item,
      preFilled: {
        quantity: itemToEdit.quantity,
        doneness: itemToEdit.doneness,
        sauce: itemToEdit.sauce,
        addons: itemToEdit.addons,
        additionalMeats: itemToEdit.additionalMeats,
        extraOptions: itemToEdit.extraOptions,
        remarks: itemToEdit.remarks
      }
    };

    showCart.value = false;
  }
};

const handleOrderSubmitted = (order) => {
  // Clear the cart after order is submitted
  cart.value = [];
  showCart.value = false;
};

const getTotalItems = () => {
  return cart.value.reduce((total, item) => total + item.quantity, 0);
};

const calculateTotal = () => {
  return cart.value.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// 初始化資料
onMounted(async () => {
  if (!store.value.name) {
    await fetchStore();
  }
  if (!menu.value.list || menu.value.list.length === 0) {
    await fetchMenu();
  }
});
</script>

<style scoped>
.main-container {
  min-height: 100vh;
  background-color: #eaeae668;
}

.center-container {
  max-width: 768px;
  margin: 0 auto;
  position: relative;
  background-color: #ffffff;
  min-height: 100vh;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

/* 定義過渡動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>