<template>
  <div class="main-container">
    <div class="center-container">

      <transition name="fade" mode="out-in">
        <MenuListing v-show="!selectedItem" :store-name="store.name" :announcements="store.announcements"
          :menu-list="menu.list" :menu-items="menuItems" @select-item="openItemDetails" />
      </transition>

      
      <transition name="fade" mode="out-in">
        <ItemDetail v-if="selectedItem" :item="selectedItem" :addon-items="addonItems" :menu-items="menuItems"
          @close="closeItemDetails" @add-to-cart="addToCart" />
      </transition>

      <!-- Shopping Cart Button -->
      <div v-if="cart.length > 0" class="position-fixed bottom-0 start-50 translate-middle-x mb-4"
        style="z-index: 1030;">
        <button class="btn btn-primary rounded-pill shadow px-4 py-2" @click="openCartModal">
          <i class="bi bi-cart-fill me-2"></i>
          {{ getTotalItems() }} 項商品 - ${{ calculateTotal() }}
        </button>
      </div>

      <!-- Shopping Cart Modal (Bootstrap standard structure) -->
      <div class="modal fade" id="cartModal" tabindex="-1" aria-labelledby="cartModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="cartModalLabel">購物車</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div v-if="cart.length === 0" class="text-center p-5 text-muted">
                <i class="bi bi-cart-x fs-1"></i>
                <p class="mt-3">購物車是空的</p>
              </div>

              <div v-else>
                <div v-for="(item, index) in cart" :key="index" class="card mb-3">
                  <div class="card-body">
                    <div class="row">
                      <div class="col-md-8">
                        <h5 class="card-title">{{ item.name }}</h5>
                        <p class="card-text small mb-1" v-if="item.doneness">熟度: {{ item.doneness }}</p>
                        <p class="card-text small mb-1" v-if="item.sauce">醬料: {{ item.sauce }}</p>
                        <p class="card-text small mb-1" v-if="item.addons && item.addons.length">
                          加點: {{ formatAddons(item.addons) }}
                        </p>
                        <p class="card-text small mb-1" v-if="item.extraOptions && item.extraOptions.length">
                          額外需求: {{ item.extraOptions.join(', ') }}
                        </p>
                        <p class="card-text small mb-1" v-if="item.remarks">
                          備註: {{ item.remarks }}
                        </p>
                      </div>
                      <div class="col-md-4 d-flex flex-column align-items-end justify-content-between">
                        <button class="btn btn-sm btn-outline-danger mb-2" @click="removeFromCart(index)">
                          <i class="bi bi-trash"></i>
                        </button>
                        <div class="d-flex align-items-center">
                          <div class="input-group input-group-sm me-3" style="width: 100px;">
                            <button class="btn btn-outline-secondary"
                              @click="updateCartItemQuantity(index, -1)">-</button>
                            <span class="form-control text-center">{{ item.quantity }}</span>
                            <button class="btn btn-outline-secondary"
                              @click="updateCartItemQuantity(index, 1)">+</button>
                          </div>
                          <div class="text-end">
                            <p class="mb-0 fw-bold">${{ (item.price * item.quantity).toFixed(2) }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer flex-column">
              <div class="d-flex justify-content-between w-100">
                <span class="fw-bold">小計：</span>
                <span class="fw-bold">${{ calculateTotal() }}</span>
              </div>
              <button class="btn btn-primary w-100 mt-3"
                :disabled="cart.length === 0 || (orderType === 'dineIn' && !tableNumber)" @click="checkout">
                <span v-if="orderType === 'dineIn' && !tableNumber">請先輸入桌號</span>
                <span v-else>前往結帳</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import MenuListing from '@/components/OrderComponents/Main.vue';
import ItemDetail from '@/components/OrderComponents/ItemDetail.vue';

const route = useRoute();
const router = useRouter();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const storeId = route.params.store;
const queryOrderType = route.query.orderType;
const queryTable = route.query.table;

// State
const store = ref({});
const menu = ref({});
const menuItems = ref([]);
const addonItems = ref([]);
const orderType = ref(queryOrderType || 'dineIn');
const tableNumber = ref(queryTable || '0');
const selectedItem = ref(null);
const cart = ref([]);

// Bootstrap modal instance
let cartModal = null;

const fetchStore = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/store/${storeId}`);
    store.value = response.data;
    // console.log(store.value);
  } catch (error) {
    console.error('Error fetching store:', error);
  }
};

const fetchMenu = async () => {
  menu.value = store.value.menuItem;
  // console.log('menu', menu.value);

  const itemPromises = [];
  for (const category of menu.value.list) {
    for (const item of category.items) {
      itemPromises.push(axios.get(`${API_BASE_URL}/dish/${item.itemModel.charAt(0).toLowerCase() + item.itemModel.slice(1)}/${item.itemId}`));
    }
  }

  const dishModelMapping = {};
  if (menu.value && menu.value.list) {
    menu.value.list.forEach(category => {
      category.items.forEach(item => {
        dishModelMapping[item.itemId] = item.itemModel;
      });
    });
  }
  const itemResponses = await Promise.all(itemPromises);
  menuItems.value = itemResponses.map(response => {
    return {
      ...response.data,
      itemModel: dishModelMapping[response.data._id]
    };
  });

  // console.log('menuItems', menuItems.value);
  const { data: addons } = await axios.get(`${API_BASE_URL}/dish/addon`);
  addonItems.value = addons;
};

const openItemDetails = (item) => {
  selectedItem.value = item;
  // console.log(item);
};

const closeItemDetails = () => {
  selectedItem.value = null;
};

const addToCart = (item) => {
  cart.value.push(item);
};

const openCartModal = () => {
  cartModal.show();
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

  // If cart is empty, close the modal
  if (cart.value.length === 0) {
    cartModal.hide();
  }
};

const getTotalItems = () => {
  return cart.value.reduce((total, item) => total + item.quantity, 0);
};

const calculateTotal = () => {
  return cart.value.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
};

const formatAddons = (addons) => {
  return addons.map(addon => addon.name).join(', ');
};

const checkout = async () => {
  if (orderType.value === 'dineIn' && !tableNumber.value) {
    alert('請輸入桌號');
    return;
  }

  try {
    const orderItems = cart.value.map(item => ({
      itemModel: item.itemModel,
      itemId: item.id,
      amount: item.quantity,
      options: {
        doneness: item.doneness,
        sauce: item.sauce,
        addons: item.addons.map(a => a.id),
        extraOptions: item.extraOptions,
        additionalMeats: item.additionalMeats?.map(m => m.id) || [],
        remarks: item.remarks
      }
    }));

    const orderAmount = parseFloat(calculateTotal());
    const orderData = {
      store: storeId,
      orderNumber: String(await generateOrderNumber()),
      platform: 'web',
      pickupMethod: orderType.value === 'dineIn' ? '內用' : '外帶',
      paymentMethod: 'store',
      orderAmount,
      totalPaid: orderAmount,
      tableNumber: orderType.value === 'dineIn' ? tableNumber.value : null,
      items: orderItems,
      remarks: cart.value.some(item => item.remarks) ? cart.value.map(item => item.remarks).filter(Boolean).join(' / ') : null
    };

    const { data: newOrder } = await axios.post(`${API_BASE_URL}/order`, orderData);
    cartModal.hide();
    router.push(`/customer/confirmation/${newOrder._id}`);
  } catch (error) {
    console.error('Error creating order:', error);
    alert('訂單建立失敗，請重試');
  }
};

const generateOrderNumber = async () => {
  const number = await axios.get(`${API_BASE_URL}/order/number`);
  return number.data.number;
};

// Initialize Bootstrap modal
const initModal = () => {
  // Import Bootstrap's modal JavaScript
  import('bootstrap/js/dist/modal').then(module => {
    const Modal = module.default;

    // Initialize cart modal
    const cartModalElement = document.getElementById('cartModal');
    if (cartModalElement) {
      cartModal = new Modal(cartModalElement);
    }
  });
};

onMounted(async () => {
  if (!store.value.name) {
    await fetchStore();
  }
  if (!menu.value.list || menu.value.list.length === 0) {
    await fetchMenu();
  }
  initModal();
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