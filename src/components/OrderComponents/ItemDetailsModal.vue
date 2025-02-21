<template>
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
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
          <button type="button" class="btn btn-primary" @click="addToCart">
            加入購物車 - ${{ calculateItemTotal() }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Modal } from 'bootstrap';

const props = defineProps({
  selectedItem: {
    type: Object,
    required: true
  },
  addonItems: {
    type: Array,
    default: () => []
  },
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:isOpen', 'close', 'add-to-cart']);

// State
const quantity = ref(1);
const remarks = ref('');
const selectedDoneness = ref('');
const selectedSauce = ref('');
const selectedAddons = ref([]);
const selectedExtraOptions = ref([]);
let modal = null;

// Methods
const initializeModal = () => {
  const modalElement = document.getElementById('itemDetailsModal');
  if (modalElement) {
    modal = new Modal(modalElement, {
      backdrop: 'static',
      keyboard: false
    });

    modalElement.addEventListener('hidden.bs.modal', () => {
      emit('update:isOpen', false);
      emit('close');
      resetForm();
    });
  }
};

const resetForm = () => {
  quantity.value = 1;
  remarks.value = '';
  selectedDoneness.value = props.selectedItem?.steakDoneness?.[0] || '';
  selectedSauce.value = props.selectedItem?.sauceOptions?.[0] || '';
  selectedAddons.value = [];
  selectedExtraOptions.value = [];
};

const showModal = () => {
  if (modal) {
    resetForm();
    modal.show();
  }
};

const hideModal = () => {
  if (modal) {
    modal.hide();
  }
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
  if (!props.selectedItem) return 0;

  let total = props.selectedItem.price * quantity.value;

  // Add extra price for selected extra options
  if (selectedExtraOptions.value.length > 0 && props.selectedItem.extraPrice) {
    total += props.selectedItem.extraPrice * quantity.value;
  }

  // Add price for selected addons
  for (const addonId of selectedAddons.value) {
    const addon = props.addonItems.find(a => a._id === addonId);
    if (addon) {
      total += addon.price * quantity.value;
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

  const cartItem = {
    id: props.selectedItem._id,
    itemModel: props.selectedItem.itemModel,
    name: props.selectedItem.name,
    price: parseFloat(calculateItemTotal()) / quantity.value,
    quantity: quantity.value,
    doneness: selectedDoneness.value,
    sauce: selectedSauce.value,
    addons,
    extraOptions: selectedExtraOptions.value,
    remarks: remarks.value
  };

  emit('add-to-cart', cartItem);
  hideModal();
};

// Watchers
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    showModal();
  } else {
    hideModal();
  }
});

watch(() => props.selectedItem, (newItem) => {
  if (newItem) {
    selectedDoneness.value = newItem.steakDoneness?.[0] || '';
    selectedSauce.value = newItem.sauceOptions?.[0] || '';
  }
}, { immediate: true });

// Initialize modal on mount
onMounted(() => {
  initializeModal();
  if (props.isOpen) {
    showModal();
  }
});
</script>