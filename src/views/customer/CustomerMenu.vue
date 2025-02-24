<!-- // src/views/CustomerOrderingPage.vue -->
<template>
  <div class="container py-4" style="max-width: 768px;">
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

    <!-- Item Details Modal (Bootstrap standard structure) -->
    <div class="modal fade" id="itemDetailsModal" tabindex="-1" aria-labelledby="itemDetailsModalLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="itemDetailsModalLabel">{{ selectedItem?.name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedItem">
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
                  </label>
                </div>
              </div>
            </div>

            <!-- Additional meat dishes (if applicable for MainDish) -->
            <div v-if="additionalMeatDishes.length > 0 && selectedItem.itemModel === 'MainDish'" class="mb-4">
              <h6 class="fw-bold mb-2">加點其他肉食單品</h6>
              <div class="d-flex flex-wrap">
                <div v-for="meat in additionalMeatDishes" :key="meat._id" class="form-check me-3 mb-2">
                  <input class="form-check-input" type="checkbox" :id="'meat-' + meat._id" v-model="selectedMeatDishes"
                    :value="meat._id">
                  <label class="form-check-label" :for="'meat-' + meat._id">
                    {{ meat.name }} (+${{ meat.extraPrice }})
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
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" @click="addToCart">
              加入購物車 - ${{ calculateItemTotal() }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Shopping Cart Button -->
    <div v-if="cart.length > 0" class="position-fixed bottom-0 start-50 translate-middle-x mb-4" style="z-index: 1030;">
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
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
const tableNumber = ref(queryTable || '0');
const activeCategory = ref('all');
const selectedItem = ref(null);
const quantity = ref(1);
const remarks = ref('');
const cart = ref([]);

// Selected options
const selectedDoneness = ref('');
const selectedSauce = ref('');
const selectedAddons = ref([]);
const selectedExtraOptions = ref([]);

// Add new ref for selected meat dishes
const selectedMeatDishes = ref([]);

// Bootstrap modal instances
let itemDetailsModal = null;
let cartModal = null;

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
      // console.log(menu.value)
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
      // console.log('menuItems',menuItems.value);
      // Fetch addon items
      const { data: addons } = await axios.get(`${API_BASE_URL}/dish/addon`);
      addonItems.value = addons;
      // console.log(addonItems.value);
    }
  } catch (error) {
    console.error('Error fetching store and menu:', error);
  }
};

const getItemsInCategory = (category) => {
  // console.log("category", category);
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
  }else{
    tableNumber.value = queryTable || '0'
  }
};

// Modify openItemDetails to reset selectedMeatDishes
const openItemDetails = (item) => {
  selectedItem.value = item;
  quantity.value = 1;
  remarks.value = '';

  // Reset selections
  selectedDoneness.value = item.steakDoneness ? item.steakDoneness[0] : '';
  selectedSauce.value = item.sauceOptions ? item.sauceOptions[0] : '';
  selectedAddons.value = [];
  selectedExtraOptions.value = [];
  selectedMeatDishes.value = [];

  nextTick(() => {
    itemDetailsModal.show();
  });
};

const closeItemDetailsModal = () => {
  itemDetailsModal.hide();
};

// Function to open cart modal
const openCartModal = () => {
  cartModal.show();
};

const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

// Modify calculateItemTotal to include additional meat dishes instead of extra options
const calculateItemTotal = () => {
  if (!selectedItem.value) return 0;

  let total = selectedItem.value.price * quantity.value;

  // Add price for selected addons
  for (const addonId of selectedAddons.value) {
    const addon = addonItems.value.find(a => a._id === addonId);
    if (addon) {
      total += addon.price * quantity.value;
    }
  }

  // Add price for selected additional meat dishes
  for (const meatId of selectedMeatDishes.value) {
    const meat = menuItems.value.find(m => m._id === meatId);
    if (meat && meat.extraPrice) {
      total += meat.extraPrice * quantity.value;
    }
  }

  return total.toFixed(2);
};

// Add new ref for additional meat dishes
const additionalMeatDishes = computed(() => {
  return menuItems.value.filter(item => 
    item.itemModel === 'MainDish' && 
    item.extraPrice && 
    item._id !== selectedItem.value?._id
  );
});

// Modify addToCart to include additional meat dishes
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

  // Get selected additional meat dishes
  const additionalMeats = selectedMeatDishes.value.map(id => {
    const meat = menuItems.value.find(m => m._id === id);
    return {
      id: meat._id,
      name: meat.name,
      price: meat.extraPrice
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
    additionalMeats,
    remarks: remarks.value
  });

  closeItemDetailsModal();
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
  return cart.value.reduce((total, item) => total + (item.price * item.quantity), 0);
};

const formatAddons = (addons) => {
  return addons.map(addon => addon.name).join(', ');
};

// Update the checkout function to include additional meat dishes in the order items
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

    // Rest of the checkout function remains the same
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
    console.log(orderData)
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
  return number.data.number
};

// Initialize Bootstrap modals
const initModals = () => {
  // Import Bootstrap's modal JavaScript
  import('bootstrap/js/dist/modal').then(module => {
    const Modal = module.default;

    // Initialize item details modal
    const itemDetailsElement = document.getElementById('itemDetailsModal');
    if (itemDetailsElement) {
      itemDetailsModal = new Modal(itemDetailsElement, {
        backdrop: 'static',
        keyboard: false
      });

      // Add event listener for when the modal is hidden
      itemDetailsElement.addEventListener('hidden.bs.modal', () => {
        selectedItem.value = null;
      });
    }

    // Initialize cart modal
    const cartModalElement = document.getElementById('cartModal');
    if (cartModalElement) {
      cartModal = new Modal(cartModalElement);
    }
  });
};

// Lifecycle hooks
onMounted(async () => {
  await fetchStoreAndMenu();
  initModals();
  // console.log('Menu:', menu.value);
});

// Watch for route changes to update store/menu
watch(() => route.params.store, (newStoreId) => {
  if (newStoreId !== storeId) {
    fetchStoreAndMenu();
  }
});
</script>

<style scoped>
.menu-items .card {
  cursor: pointer;
}
</style>