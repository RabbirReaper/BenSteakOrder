<template>
  <div class="item-detail">
    <!-- Header with back button positioned over the image -->
    <div class="header d-flex align-items-center p-3 position-absolute top-0 start-0 w-100 bg-transparent">
      <button class="btn btn-sm rounded-circle shadow" @click="$emit('close')"
        style="background-color: rgba(255, 255, 255, 0.8); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
        <i class="bi bi-arrow-left fs-4"></i>
      </button>
    </div>

    <!-- Image -->
    <div class="image-container" style="height: 240px; overflow: hidden; position: relative;">
      <img :src="item.image?.url " :alt="item.name" class="w-100 h-100" style="object-fit: cover;">
    </div>

    <!-- Item name and price -->
    <div class="p-3 border-bottom">
      <h4 class="mb-2">{{ item.name }}</h4>
      <p class="text-danger fw-bold mb-2">${{ item.price }}</p>
      <p class="text-muted small">{{ item.description }}</p>
    </div>

    <!-- Options section -->
    <div class="options p-3 border-bottom">
      <!-- Steak Doneness options (if applicable) -->
      <div v-if="item.category === 'Steak'" class="mb-4">
        <h6 class="fw-bold mb-2">熟度選擇</h6>
        <div class="d-flex flex-wrap">
          <div v-for="doneness in item.steakDoneness" :key="doneness" class="form-check me-3 mb-2">
            <input class="form-check-input" type="radio" :id="'doneness-' + doneness" v-model="selectedDoneness"
              :value="doneness">
            <label class="form-check-label" :for="'doneness-' + doneness">{{ doneness }}</label>
          </div>
        </div>
      </div>

      <!-- Sauce options (if applicable) -->
      <div v-if="item.sauceOptions && item.sauceOptions.length" class="mb-4">
        <h6 class="fw-bold mb-2">醬料選擇</h6>
        <div class="d-flex flex-wrap">
          <div v-for="sauce in item.sauceOptions" :key="sauce" class="form-check me-3 mb-2">
            <input class="form-check-input" type="radio" :id="'sauce-' + sauce" v-model="selectedSauce" :value="sauce">
            <label class="form-check-label" :for="'sauce-' + sauce">{{ sauce }}</label>
          </div>
        </div>
      </div>

      <!-- Add-ons (if applicable for MainDish) -->
      <div v-if="addonItems.length > 0 && item.itemModel === 'MainDish'" class="mb-4">
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
      <div v-if="item.extraOptions && item.extraOptions.length" class="mb-4">
        <h6 class="fw-bold mb-2">額外需求</h6>
        <div class="d-flex flex-wrap">
          <div v-for="option in item.extraOptions" :key="option" class="form-check me-3 mb-2">
            <input class="form-check-input" type="checkbox" :id="'extra-' + option" v-model="selectedExtraOptions"
              :value="option">
            <label class="form-check-label" :for="'extra-' + option">
              {{ option }}
            </label>
          </div>
        </div>
      </div>

      <!-- Additional meat dishes (if applicable for MainDish) -->
      <div v-if="additionalMeatDishes.length > 0 && item.itemModel === 'MainDish'" class="mb-4">
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
    </div>

    <!-- Remarks section -->
    <div class="p-3 border-bottom">
      <h6 class="fw-bold mb-2">特殊要求</h6>
      <textarea class="form-control" v-model="remarks" rows="3" placeholder="例如：不要洋蔥..."></textarea>
    </div>

    <!-- Quantity section -->
    <div class="p-3 d-flex align-items-center justify-content-between">
      <h6 class="fw-bold mb-0">數量</h6>
      <div class="input-group" style="width: 140px;">
        <button class="btn btn-outline-secondary" @click="decreaseQuantity">-</button>
        <span class="form-control text-center">{{ quantity }}</span>
        <button class="btn btn-outline-secondary" @click="increaseQuantity">+</button>
      </div>
    </div>

    <!-- Add to cart button -->
    <div class="p-3 position-sticky bottom-0 bg-white border-top">
      <button type="button" class="btn btn-primary w-100 py-2" @click="addToCart">
        加入購物車 - ${{ calculateItemTotal() }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  addonItems: {
    type: Array,
    default: () => []
  },
  menuItems: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'add-to-cart']);

// State
const quantity = ref(1);
const remarks = ref('');
const selectedDoneness = ref('');
const selectedSauce = ref('');
const selectedAddons = ref([]);
const selectedExtraOptions = ref([]);
const selectedMeatDishes = ref([]);

// Set default values when item changes
watch(() => props.item, (newItem) => {
  if (newItem) {
    quantity.value = 1;
    remarks.value = '';
    selectedDoneness.value = newItem.steakDoneness ? newItem.steakDoneness[0] : '';
    selectedSauce.value = newItem.sauceOptions ? newItem.sauceOptions[0] : '';
    selectedAddons.value = [];
    selectedExtraOptions.value = [];
    selectedMeatDishes.value = [];
  }
}, { immediate: true });

// Computed
const additionalMeatDishes = computed(() => {
  return props.menuItems.filter(item =>
    item.itemModel === 'MainDish' &&
    item.extraPrice &&
    item._id !== props.item?._id
  );
});

// Methods
const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const calculateItemTotal = () => {
  let total = props.item.price * quantity.value;

  // Add price for selected addons
  for (const addonId of selectedAddons.value) {
    const addon = props.addonItems.find(a => a._id === addonId);
    if (addon) {
      total += addon.price * quantity.value;
    }
  }

  // Add price for selected additional meat dishes
  for (const meatId of selectedMeatDishes.value) {
    const meat = props.menuItems.find(m => m._id === meatId);
    if (meat && meat.extraPrice) {
      total += meat.extraPrice * quantity.value;
    }
  }

  return total.toFixed(2);
};

const addToCart = () => {
  // Get selected addon details
  const addons = selectedAddons.value.map(id => {
    const addon = props.addonItems.find(a => a._id === id);
    return {
      id: addon._id,
      name: addon.name,
      price: addon.price
    };
  });

  // Get selected additional meat dishes
  const additionalMeats = selectedMeatDishes.value.map(id => {
    const meat = props.menuItems.find(m => m._id === id);
    return {
      id: meat._id,
      name: meat.name,
      price: meat.extraPrice
    };
  });

  const cartItem = {
    id: props.item._id,
    itemModel: props.item.itemModel,
    name: props.item.name,
    price: calculateItemTotal() / quantity.value,
    quantity: quantity.value,
    doneness: selectedDoneness.value,
    sauce: selectedSauce.value,
    addons,
    extraOptions: selectedExtraOptions.value,
    additionalMeats,
    remarks: remarks.value
  };

  emit('add-to-cart', cartItem);
  emit('close');
};
</script>

<style scoped>
.item-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.header {
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.options {
  overflow-y: auto;
}
</style>