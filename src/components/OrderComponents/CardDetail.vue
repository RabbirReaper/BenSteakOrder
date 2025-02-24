<template>
  <div class="main-container">
    <div class="center-container">
      <!-- Main Menu View -->
      <div v-show="!isItemDetailsVisible" class="view-container">
        <div class="nav-container">
          <div class="nav-wrapper autohide">
            <nav class="navbar navbar-expand-lg navbar-light">
              <div class="container-fluid">
                <a class="navbar-brand fw-bold" href="#">奔野牛排 {{ store.name }}</a>
                <a class="nav-link" href="#"> Menu item </a>
              </div>
            </nav>
            <div class="nav-border"></div>
          </div>
        </div>

        <!-- Rest of your existing menu content -->
        <div class="content-wrapper" style="padding: 0;">
          <img style="max-height: 200px; width: 100%; padding: 0;"
            src="https://media.discordapp.net/attachments/1180694061573750784/1343283614644699166/dsa95wawd9_Shinkai_Makoto_dark_city_ocean_mountain_Sword_Art_On_6bf493b4-a797-4e49-b8e8-6f026f259430.png?ex=67bcb5da&is=67bb645a&hm=526a63515c6780ee1600c34b89182880d9457752e869138f9dec2dc96477b88c&=&format=webp&quality=lossless&width=1202&height=676"
            alt="pic">
        </div>

        <!-- Menu Categories and Items -->
        <div class="content-wrapper mt-4">
          <div v-for="category in menu.list" :key="category._id">
            <h4 class="fw-bold mt-3">{{ category.categoryName }}</h4>
            <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              <div v-for="item in getItemsInCategory(category)" :key="item._id" class="col">
                <div class="card h-100 shadow-sm" @click="showItemDetails(item)">
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
            <div class="nav-border mt-4" style="height: 2px;"></div>
          </div>
        </div>
      </div>

      <!-- Item Details View -->
      <div v-show="isItemDetailsVisible" class="view-container item-details-view">
        <div class="nav-container">
          <div class="nav-wrapper">
            <nav class="navbar navbar-expand-lg navbar-light">
              <div class="container-fluid">
                <button class="btn btn-link" @click="hideItemDetails">
                  <i class="bi bi-arrow-left"></i> 返回
                </button>
                <h5 class="mb-0">{{ selectedItem?.name }}</h5>
                <div style="width: 40px;"></div> <!-- Spacer for alignment -->
              </div>
            </nav>
            <div class="nav-border"></div>
          </div>
        </div>

        <div class="content-wrapper" v-if="selectedItem">
          <div class="text-center mb-3">
            <img :src="selectedItem.image?.url || '/placeholder.jpg'" :alt="selectedItem.name"
              class="img-fluid rounded" style="max-height: 200px; object-fit: cover;">
            <h5 class="mt-2 text-danger fw-bold">${{ selectedItem.price }}</h5>
            <p class="text-muted">{{ selectedItem.description }}</p>
          </div>

          <!-- Steak Doneness options -->
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

          <!-- Sauce options -->
          <div v-if="selectedItem.sauceOptions?.length" class="mb-4">
            <h6 class="fw-bold mb-2">醬料選擇</h6>
            <div class="d-flex flex-wrap">
              <div v-for="sauce in selectedItem.sauceOptions" :key="sauce" class="form-check me-3 mb-2">
                <input class="form-check-input" type="radio" :id="'sauce-' + sauce" v-model="selectedSauce"
                  :value="sauce">
                <label class="form-check-label" :for="'sauce-' + sauce">{{ sauce }}</label>
              </div>
            </div>
          </div>

          <!-- Add-ons -->
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

          <!-- Extra options -->
          <div v-if="selectedItem.extraOptions?.length" class="mb-4">
            <h6 class="fw-bold mb-2">額外需求</h6>
            <div class="d-flex flex-wrap">
              <div v-for="option in selectedItem.extraOptions" :key="option" class="form-check me-3 mb-2">
                <input class="form-check-input" type="checkbox" :id="'extra-' + option" v-model="selectedExtraOptions"
                  :value="option">
                <label class="form-check-label" :for="'extra-' + option">{{ option }}</label>
              </div>
            </div>
          </div>

          <!-- Quantity -->
          <div class="mb-4">
            <h6 class="fw-bold mb-2">數量</h6>
            <div class="input-group" style="width: 140px;">
              <button class="btn btn-outline-secondary" @click="decreaseQuantity">-</button>
              <span class="form-control text-center">{{ quantity }}</span>
              <button class="btn btn-outline-secondary" @click="increaseQuantity">+</button>
            </div>
          </div>

          <!-- Remarks -->
          <div class="mb-4">
            <h6 class="fw-bold mb-2">特殊要求</h6>
            <textarea class="form-control" v-model="remarks" rows="3" placeholder="例如：不要洋蔥..."></textarea>
          </div>

          <!-- Add to Cart Button -->
          <div class="fixed-bottom center-container">
            <div class="p-3 bg-white border-top">
              <button class="btn btn-primary w-100" @click="addToCart">
                加入購物車 - ${{ calculateItemTotal() }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const storeId = route.params.store;

const store = ref({});
const menu = ref({});
const menuItems = ref([]);
const addonItems = ref([]);

// Item details state
const isItemDetailsVisible = ref(false);
const selectedItem = ref(null);
const quantity = ref(1);
const remarks = ref('');
const selectedDoneness = ref('');
const selectedSauce = ref('');
const selectedAddons = ref([]);
const selectedExtraOptions = ref([]);
const selectedMeatDishes = ref([]);

// Show item details
const showItemDetails = (item) => {
  selectedItem.value = item;
  quantity.value = 1;
  remarks.value = '';
  
  // Reset selections
  selectedDoneness.value = item.steakDoneness ? item.steakDoneness[0] : '';
  selectedSauce.value = item.sauceOptions ? item.sauceOptions[0] : '';
  selectedAddons.value = [];
  selectedExtraOptions.value = [];
  selectedMeatDishes.value = [];
  
  isItemDetailsVisible.value = true;
  window.scrollTo(0, 0);
};

// Hide item details
const hideItemDetails = () => {
  isItemDetailsVisible.value = false;
};

// Quantity controls
const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

// Calculate total
const calculateItemTotal = () => {
  let total = selectedItem.value.price * quantity.value;
  // Add addon prices
  selectedAddons.value.forEach(addonId => {
    const addon = addonItems.value.find(a => a._id === addonId);
    if (addon) {
      total += addon.price;
    }
  });
  return total.toFixed(2);
};

// Add to cart
const addToCart = () => {
  // Implement your cart logic here
  hideItemDetails();
};

// Your existing fetch functions and other logic...
const fetchStore = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/store/${storeId}`);
    store.value = response.data;
  } catch (error) {
    console.error('Error fetching store:', error);
  }
};

const fetchMenu = async () => {
  menu.value = store.value.menuItem;
  
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
  menuItems.value = itemResponses.map(response => ({
    ...response.data,
    itemModel: dishModelMapping[response.data._id]
  }));

  const { data: addons } = await axios.get(`${API_BASE_URL}/dish/addon`);
  addonItems.value = addons;
};

const getItemsInCategory = (category) => {
  return menuItems.value.filter(item => {
    return category.items.some(catItem => catItem.itemId === item._id);
  }).sort((a, b) => {
    const aOrder = category.items.find(item => item.itemId === a._id)?.order || 0;
    const bOrder = category.items.find(item => item.itemId === b._id)?.order || 0;
    return aOrder - bOrder;
  });
};

onMounted(async () => {
  await fetchStore();
  await fetchMenu();
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

.view-container {
  min-height: 100vh;
  padding-bottom: 80px; /* Space for fixed bottom button */
}

.nav-container {
  position: fixed;
  top: 0;
  width: 100%;
  max-width: 768px;
  z-index: 1030;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ffffff;
}

.nav-wrapper {
  width: 100%;
  background-color: #ffffff;
}

.navbar {
  width: 100%;
  background-color: #ffffff;
  margin-bottom: 0;
}

.nav-border {
  height: 1px;
  background-color: #dee2e6;
  width: 100%;
}

.content-wrapper {
  width: 100%;
  padding: 15px;
  margin-top: 56px; /* Height of navbar */
}

.item-details-view {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #ffffff;
  min-height: 100vh;
}

/* Animation classes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>