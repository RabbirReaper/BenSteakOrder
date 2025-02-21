<template>
  <div>
    <!-- Shopping Cart Button -->
    <div v-if="items.length > 0" class="position-fixed bottom-0 start-50 translate-middle-x mb-4" style="z-index: 1030;">
      <button class="btn btn-primary rounded-pill shadow px-4 py-2" @click="showModal">
        <i class="bi bi-cart-fill me-2"></i>
        {{ getTotalItems() }} 項商品 - ${{ calculateTotal() }}
      </button>
    </div>

    <!-- Shopping Cart Modal -->
    <div class="modal fade" id="cartModal" tabindex="-1" aria-labelledby="cartModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="cartModalLabel">購物車</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="items.length === 0" class="text-center p-5 text-muted">
              <i class="bi bi-cart-x fs-1"></i>
              <p class="mt-3">購物車是空的</p>
            </div>

            <div v-else>
              <div v-for="(item, index) in items" :key="index" class="card mb-3">
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
                      <button class="btn btn-sm btn-outline-danger mb-2" @click="removeItem(index)">
                        <i class="bi bi-trash"></i>
                      </button>
                      <div class="d-flex align-items-center">
                        <div class="input-group input-group-sm me-3" style="width: 100px;">
                          <button class="btn btn-outline-secondary"
                            @click="updateItemQuantity(index, -1)">-</button>
                          <span class="form-control text-center">{{ item.quantity }}</span>
                          <button class="btn btn-outline-secondary"
                            @click="updateItemQuantity(index, 1)">+</button>
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
              :disabled="items.length === 0 || (orderType === 'dineIn' && !tableNumber)"
              @click="handleCheckout">
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
import { ref, onMounted, watch } from 'vue';
import { Modal } from 'bootstrap';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  orderType: {
    type: String,
    required: true
  },
  tableNumber: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'checkout']);

// Internal state
let modal = null;
const items = ref(props.modelValue);

// Methods
const initModal = () => {
  const modalElement = document.getElementById('cartModal');
  if (modalElement) {
    modal = new Modal(modalElement);
  }
};

const showModal = () => {
  if (modal) {
    modal.show();
  }
};

const hideModal = () => {
  if (modal) {
    modal.hide();
  }
};

const getTotalItems = () => {
  return items.value.reduce((total, item) => total + item.quantity, 0);
};

const calculateTotal = () => {
  return items.value.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0).toFixed(2);
};

const formatAddons = (addons) => {
  return addons.map(addon => addon.name).join(', ');
};

const updateItemQuantity = (index, change) => {
  const newQuantity = items.value[index].quantity + change;
  if (newQuantity > 0) {
    const updatedItems = [...items.value];
    updatedItems[index].quantity = newQuantity;
    items.value = updatedItems;
    emit('update:modelValue', items.value);
  } else {
    removeItem(index);
  }
};

const removeItem = (index) => {
  const updatedItems = [...items.value];
  updatedItems.splice(index, 1);
  items.value = updatedItems;
  emit('update:modelValue', items.value);

  if (items.value.length === 0) {
    hideModal();
  }
};

const handleCheckout = () => {
  if (props.orderType === 'dineIn' && !props.tableNumber) {
    alert('請輸入桌號');
    return;
  }
  emit('checkout');
  hideModal();
};

// Watchers
watch(() => props.modelValue, (newValue) => {
  items.value = newValue;
}, { deep: true });

// Lifecycle hooks
onMounted(() => {
  initModal();
});
</script>