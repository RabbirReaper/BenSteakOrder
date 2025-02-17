<!-- // src/views/CustomerOrderingPage.vue -->
<template>
  <div class="container py-4">
    <header class="text-center mb-4">
      <h1 class="mb-3">{{ store.name }}</h1>
      <div class="btn-group mb-3">
        <button class="btn"
          :class="{ 'btn-primary': orderType === 'dineIn', 'btn-outline-primary': orderType !== 'dineIn' }"
          @click="setOrderType('dineIn')">內用</button>
        <button class="btn"
          :class="{ 'btn-primary': orderType === 'takeout', 'btn-outline-primary': orderType !== 'takeout' }"
          @click="setOrderType('takeout')">外帶</button>
      </div>
      <div v-if="orderType === 'dineIn'" class="mb-3">
        <div class="input-group justify-content-center" style="width: 200px; margin: 0 auto;">
          <span class="input-group-text">桌號</span>
          <input class="form-control" v-model="tableNumber" type="text" placeholder="請輸入桌號" />
        </div>
      </div>
    </header>

    <div class="row mb-4" v-if="menu">
      <div class="col-12 d-flex overflow-auto pb-2">
        <button v-for="category in sortedCategories" :key="category.categoryName"
          :class="{ 'btn-primary': activeCategory === category.categoryName, 'btn-outline-primary': activeCategory !== category.categoryName }"
          class="btn mx-1 flex-shrink-0" @click="activeCategory = category.categoryName">
          {{ category.categoryName }}
        </button>
      </div>
    </div>

    <div class="menu-items mb-5" v-if="menu">
      <div v-for="category in sortedCategories" :key="category.categoryName">
        <div v-if="activeCategory === category.categoryName || activeCategory === 'all'">
          <h2 class="mb-3">{{ category.categoryName }}</h2>
          <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            <div v-for="item in getItemsInCategory(category)" :key="item._id" class="col">
              <div class="card h-100 shadow-sm" @click="openItemDetails(item)">
                <div class="card-img-top" style="aspect-ratio: 1/1; overflow: hidden;">
                  <img :src="item.image?.url || '/placeholder.jpg'" :alt="item.name" class="w-100 h-100"
                    style="object-fit: cover;">
                </div>
                <div class="card-body">
                  <h5 class="card-title">{{ item.name }}</h5>
                  <p class="card-text text-danger fw-bold">${{ item.price }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Item Details Modal -->
    <div v-if="selectedItem" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedItem.name }}</h5>
            <button type="button" class="btn-close" @click="closeItemDetails"></button>
          </div>
          <div class="modal-body">
            <div class="text-center mb-3">
              <img :src="selectedItem.image?.url || '/placeholder.jpg'" :alt="selectedItem.name"
                class="img-fluid rounded" style="max-height: 200px; object-fit: cover;">
              <h5 class="mt-2 text-danger fw-bold">${{ selectedItem.price }}</h5>
              <p class="text-muted">{{ selectedItem.description }}</p>
            </div>

            <!-- Steak Doneness options (if applicable) -->
            <div v-if="selectedItem.category === 'Steak'" class="mb-4">
              <h6 class="fw-bold mb-2">熟度選擇</h6>
              <div class="d-flex flex-wrap">
                <div v-for="doneness in selectedItem.steakDoneness" :key="doneness" class="form-check me-3 mb-2">
                  <input class="form-check-input" type="radio" :id="'doneness-' + doneness" v-model="selectedDoneness"
                    :value="doneness">
                  <label class="form-check-label" :for="'doneness-' + doneness">{{ doneness }}</label>
                </div>
              </div>
            </div>

            <!-- Sauce options (if applicable) -->
            <div v-if="selectedItem.sauceOptions && selectedItem.sauceOptions.length" class="mb-4">
              <h6 class="fw-bold mb-2">醬料選擇</h6>
              <div class="d-flex flex-wrap">
                <div v-for="sauce in selectedItem.sauceOptions" :key="sauce" class="form-check me-3 mb-2">
                  <input class="form-check-input" type="radio" :id="'sauce-' + sauce" v-model="selectedSauce"
                    :value="sauce">
                  <label class="form-check-label" :for="'sauce-' + sauce">{{ sauce }}</label>
                </div>
              </div>
            </div>

            <!-- Add-ons (if applicable for MainDish) -->
            <div v-if="addonItems.length > 0 && selectedItem.itemModel === 'MainDish'" class="mb-4">
              <h6 class="fw-bold mb-2">加點選項</h6>
              <div class="d-flex flex-wrap">
                <div v-for="addon in addonItems" :key="addon._id" class="form-check me-3 mb-2">
                  <input class="form-check-input" type="checkbox" :id="'addon-' + addon._id" v-model="selectedAddons"
                    :value="addon._id">
                  <label class="form-check-label" :for="'addon-' + addon._id">
                    {{ addon.name }} (+${{ addon.price }})
                  </label>
                </div>
              </div>
            </div>

            <!-- Extra options (if applicable) -->
            <div v-if="selectedItem.extraOptions && selectedItem.extraOptions.length" class="mb-4">
              <h6 class="fw-bold mb-2">額外需求</h6>
              <div class="d-flex flex-wrap">
                <div v-for="option in selectedItem.extraOptions" :key="option" class="form-check me-3 mb-2">
                  <input class="form-check-input" type="checkbox" :id="'extra-' + option" v-model="selectedExtraOptions"
                    :value="option">
                  <label class="form-check-label" :for="'extra-' + option">
                    {{ option }}
                    <span v-if="selectedItem.extraPrice">(+${{ selectedItem.extraPrice }})</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="mb-4">
              <h6 class="fw-bold mb-2">數量</h6>
              <div class="input-group" style="width: 140px;">
                <button class="btn btn-outline-secondary" @click="decreaseQuantity">-</button>
                <span class="form-control text-center">{{ quantity }}</span>
                <button class="btn btn-outline-secondary" @click="increaseQuantity">+</button>
              </div>
            </div>

            <div class="mb-4">
              <h6 class="fw-bold mb-2">特殊要求</h6>
              <textarea class="form-control" v-model="remarks" rows="3" placeholder="例如：不要洋蔥..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeItemDetails">取消</button>
            <button type="button" class="btn btn-primary" @click="addToCart">
              加入購物車 - ${{ calculateItemTotal() }}
            </button>
          </div>
        </div>
      </div>

    </div>
    
    <div v-if="selectedItem" class="modal-backdrop show"></div>

    <!-- Shopping Cart Button -->
    <div v-if="cart.length > 0" class="position-fixed bottom-0 start-50 translate-middle-x mb-4" style="z-index: 1030;">
      <button class="btn btn-primary rounded-pill shadow px-4 py-2" @click="showCart = true">
        <i class="bi bi-cart-fill me-2"></i>
        {{ getTotalItems() }} 項商品 - ${{ calculateTotal() }}
      </button>
    </div>

    <!-- Shopping Cart Modal -->
    <div v-if="showCart" class="modal show d-block fade" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">購物車</h5>
            <button type="button" class="btn-close" @click="showCart = false"></button>
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
                          <button class="btn btn-outline-secondary" @click="updateCartItemQuantity(index, 1)">+</button>
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
      <!-- <div class="modal-backdrop show"></div> -->
    </div>
    <div v-if="showCart" class="modal-backdrop show"></div>
  </div>
</template>

<style scoped>
.modal-content {
  z-index: 1050;
  /* Higher than the backdrop */
}
</style>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const storeId = route.params.store;
const queryOrderType = route.query.orderType;
const queryTable = route.query.table;

// State
const store = ref({});
const menu = ref(null);
const menuItems = ref([]);
const addonItems = ref([]);
const orderType = ref(queryOrderType || 'dineIn');
const tableNumber = ref(queryTable || '');
const activeCategory = ref('all');
const selectedItem = ref(null);
const quantity = ref(1);
const remarks = ref('');
const cart = ref([]);
const showCart = ref(false);

// Selected options
const selectedDoneness = ref('');
const selectedSauce = ref('');
const selectedAddons = ref([]);
const selectedExtraOptions = ref([]);

// Computed properties
const sortedCategories = computed(() => {
  if (!menu.value || !menu.value.list) return [];
  return [...menu.value.list].sort((a, b) => a.order - b.order);
});

// Methods
const fetchStoreAndMenu = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/store/${storeId}`);
    const storeData = response.data;
    store.value = storeData;
    if (storeData.menuItem) {
      menu.value = storeData.menuItem;
      // Fetch all menu items
      const itemPromises = [];
      for (const category of menu.value.list) {
        for (const item of category.items) {
          itemPromises.push(axios.get(`${API_BASE_URL}/dish/${item.itemModel.charAt(0).toLowerCase() + item.itemModel.slice(1)}/${item.itemId}`));
        }
      }

      const itemResponses = await Promise.all(itemPromises);
      // console.log(itemResponses);
      menuItems.value = itemResponses.map(response => ({
        ...response.data,
        itemModel: response.data.constructor.modelName || response.config.url.split('/')[2].charAt(0).toUpperCase() + response.config.url.split('/')[2].slice(1).replace(/s$/, '')
      }));

      // Fetch addon items
      const { data: addons } = await axios.get(`${API_BASE_URL}/addon`);
      addonItems.value = addons;
    }
  } catch (error) {
    console.error('Error fetching store and menu:', error);
  }
};

const getItemsInCategory = (category) => {
  // console.log(menuItems.value);
  return menuItems.value.filter(item => {
    return category.items.some(catItem => catItem.itemId === item._id);
  }).sort((a, b) => {
    const aOrder = category.items.find(item => item.itemId === a._id)?.order || 0;
    const bOrder = category.items.find(item => item.itemId === b._id)?.order || 0;
    return aOrder - bOrder;
  });
};

const setOrderType = (type) => {
  orderType.value = type;
  if (type === 'takeout') {
    tableNumber.value = '';
  }
};

const openItemDetails = (item) => {
  selectedItem.value = item;
  quantity.value = 1;
  remarks.value = '';

  // Reset selections
  selectedDoneness.value = item.steakDoneness ? item.steakDoneness[0] : '';
  selectedSauce.value = item.sauceOptions ? item.sauceOptions[0] : '';
  selectedAddons.value = [];
  selectedExtraOptions.value = [];
};

const closeItemDetails = () => {
  selectedItem.value = null;
};

const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const calculateItemTotal = () => {
  if (!selectedItem.value) return 0;

  let total = selectedItem.value.price * quantity.value;

  // Add extra price for selected extra options
  if (selectedExtraOptions.value.length > 0 && selectedItem.value.extraPrice) {
    total += selectedItem.value.extraPrice * quantity.value;
  }

  // Add price for selected addons
  for (const addonId of selectedAddons.value) {
    const addon = addonItems.value.find(a => a._id === addonId);
    if (addon) {
      total += addon.price * quantity.value;
    }
  }

  return total.toFixed(2);
};

const addToCart = () => {
  // Get selected addon details
  const addons = selectedAddons.value.map(id => {
    const addon = addonItems.value.find(a => a._id === id);
    return {
      id: addon._id,
      name: addon.name,
      price: addon.price
    };
  });

  cart.value.push({
    id: selectedItem.value._id,
    itemModel: selectedItem.value.itemModel,
    name: selectedItem.value.name,
    price: parseFloat(calculateItemTotal()) / quantity.value,
    quantity: quantity.value,
    doneness: selectedDoneness.value,
    sauce: selectedSauce.value,
    addons,
    extraOptions: selectedExtraOptions.value,
    remarks: remarks.value
  });

  closeItemDetails();
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
    // Prepare order items in the required format
    const orderItems = cart.value.map(item => ({
      itemModel: item.itemModel,
      itemId: item.id,
      amount: item.quantity,
      options: {
        doneness: item.doneness,
        sauce: item.sauce,
        addons: item.addons.map(a => a.id),
        extraOptions: item.extraOptions,
        remarks: item.remarks
      }
    }));

    // Calculate order amount
    const orderAmount = parseFloat(calculateTotal());

    const orderData = {
      store: storeId,
      orderNumber: generateOrderNumber(),
      platform: 'web',
      pickupMethod: orderType.value === 'dineIn' ? '內用' : '外帶',
      paymentMethod: 'store', // Default to in-store payment
      orderAmount,
      totalPaid: orderAmount,
      tableNumber: orderType.value === 'dineIn' ? tableNumber.value : null,
      items: orderItems,
      remarks: cart.value.some(item => item.remarks) ? cart.value.map(item => item.remarks).filter(Boolean).join(' / ') : null
    };

    const { data: newOrder } = await axios.post(`${API_BASE_URL}/order`, orderData); //

    // Redirect to confirmation page
    router.push(`/customer/confirmation/${newOrder._id}`);
  } catch (error) {
    console.error('Error creating order:', error);
    alert('訂單建立失敗，請重試');
  }
};

const generateOrderNumber = () => {
  const date = new Date();
  const dateString = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${dateString}-${randomNum}`;
};

// Lifecycle hooks
onMounted(() => {
  fetchStoreAndMenu();
});

// Watch for route changes to update store/menu
watch(() => route.params.store, (newStoreId) => {
  if (newStoreId !== storeId) {
    fetchStoreAndMenu();
  }
});
</script>