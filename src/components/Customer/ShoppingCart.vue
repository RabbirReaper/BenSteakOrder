<template>
  <div class="cart-page">
    <!-- Header -->
    <div class="cart-header p-3 d-flex align-items-center bg-white shadow-sm">
      <button class="btn btn-link text-dark p-0" @click="goBack">
        <i class="bi bi-arrow-left fs-4"></i>
      </button>
      <h5 class="mb-0 mx-auto">購物車</h5>
    </div>

    <div class="divider"></div>

    <!-- Empty Cart Message -->
    <div v-if="cart.length === 0" class="text-center p-5 text-muted">
      <i class="bi bi-cart-x fs-1"></i>
      <p class="mt-3">購物車是空的</p>
      <button class="btn btn-primary mt-3" @click="goBack">返回菜單</button>
    </div>

    <!-- Cart Content -->
    <div v-else class="cart-content p-3">
      <!-- Order Items -->
      <div class="order-items mb-4">
        <h6 class="mb-3 fw-bold">訂單內容</h6>
        <div v-for="(item, index) in cart" :key="index" class="cart-item card mb-3 border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="card-title mb-0 fw-bold">{{ item.name }}</h6>
              <div class="item-price fw-bold">${{ (item.price * item.quantity) }}</div>
            </div>

            <div class="item-details mb-3">
              <p class="card-text small mb-1" v-if="item.doneness">熟度: {{ item.doneness }}</p>
              <p class="card-text small mb-1" v-if="item.sauce">醬料: {{ item.sauce }}</p>
              <p class="card-text small mb-1" v-if="item.addons && item.addons.length">
                加點: {{ formatAddons(item.addons) }}
              </p>
              <p class="card-text small mb-1" v-if="item.additionalMeats && item.additionalMeats.length">
                加點肉品: {{ formatAdditionalMeats(item.additionalMeats) }}
              </p>
              <p class="card-text small mb-1" v-if="item.extraOptions && item.extraOptions.length">
                額外需求: {{ item.extraOptions.join(', ') }}
              </p>
              <p class="card-text small mb-1" v-if="item.remarks">
                備註: {{ item.remarks }}
              </p>
            </div>

            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex">
                <button class="btn btn-sm btn-outline-danger me-2" @click="removeFromCart(index)">
                  <i class="bi bi-trash"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary" @click="editItem(index)">
                  <i class="bi bi-pencil"></i>
                </button>
              </div>

              <div class="quantity-control d-flex align-items-center">
                <button class="btn btn-sm btn-outline-secondary" @click="updateCartItemQuantity(index, -1)">-</button>
                <span class="mx-2">{{ item.quantity }}</span>
                <button class="btn btn-sm btn-outline-secondary" @click="updateCartItemQuantity(index, 1)">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Order Notes -->
      <div class="order-notes mb-4">
        <h6 class="mb-3 fw-bold">訂單備註</h6>
        <textarea class="form-control" rows="2" placeholder="有特殊需求嗎？請告訴我們" v-model="orderRemarks"></textarea>
      </div>

      <div class="divider"></div>

      <!-- Member Coupon -->
      <div class="member-coupon mb-4">
        <h6 class="mb-3 fw-bold">會員折價券</h6>
        <div class="d-flex align-items-center">
          <select class="form-select" v-model="selectedCoupon">
            <option value="">不使用優惠券</option>
            <option v-for="coupon in availableCoupons" :key="coupon.id" :value="coupon.id">
              {{ coupon.name }} - 折抵 ${{ coupon.value }}
            </option>
          </select>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Pickup Method -->
      <div class="pickup-method mb-4">
        <h6 class="mb-3 fw-bold">取餐方式</h6>
        <div class="d-flex flex-wrap">
          <div class="form-check me-4 mb-3">
            <input class="form-check-input" type="radio" name="pickupMethod" id="dineIn" value="dineIn"
              v-model="pickupMethod">
            <label class="form-check-label" for="dineIn">內用</label>
          </div>
          <div class="form-check me-4 mb-3">
            <input class="form-check-input" type="radio" name="pickupMethod" id="selfPickup" value="selfPickup"
              v-model="pickupMethod">
            <label class="form-check-label" for="selfPickup">自取</label>
          </div>
          <div class="form-check mb-3">
            <input class="form-check-input" type="radio" name="pickupMethod" id="delivery" value="delivery"
              v-model="pickupMethod">
            <label class="form-check-label" for="delivery">外送</label>
          </div>
        </div>

        <!-- Conditional fields based on pickup method -->
        <div v-if="pickupMethod === 'dineIn'" class="mt-3">
          <label for="tableNumber" class="form-label">桌號</label>
          <input type="text" class="form-control" id="tableNumber" v-model="tableNumber" placeholder="請輸入桌號">
        </div>

        <div v-if="pickupMethod === 'delivery'" class="mt-3">
          <label for="deliveryAddress" class="form-label">外送地址</label>
          <textarea class="form-control" id="deliveryAddress" rows="2" v-model="deliveryAddress"
            placeholder="請輸入詳細外送地址"></textarea>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Pickup Time -->
      <div class="pickup-time mt-2">
        <h6 class="mb-3 fw-bold">取餐時間</h6>
        <div class="d-flex">
          <div class="form-check me-4">
            <input class="form-check-input" type="radio" name="pickupTime" id="asap" value="asap" v-model="pickupTime">
            <label class="form-check-label" for="asap">盡快取餐</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="pickupTime" id="scheduled" value="scheduled"
              v-model="pickupTime">
            <label class="form-check-label" for="scheduled">預約時間</label>
          </div>
        </div>

        <div v-if="pickupTime === 'scheduled'" class="mt-3">
          <input type="datetime-local" class="form-control" v-model="scheduledTime" :min="minPickupTime">
        </div>
      </div>

      <div class="divider"></div>

      <!-- Payment Method -->
      <div class="payment-method mt-2 mb-2">
        <h6 class="mb-3 fw-bold">付款方式</h6>
        <div class="d-flex flex-wrap">
          <div class="form-check me-4 mb-2">
            <input class="form-check-input" type="radio" name="paymentMethod" id="cash" value="現金"
              v-model="paymentMethod">
            <label class="form-check-label" for="cash">現場支付</label>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Order Total -->
      <div class="order-total mb-4">
        <div class="d-flex justify-content-between mb-2">
          <span>小計</span>
          <span>${{ calculateSubtotal() }}</span>
        </div>
        <div class="d-flex justify-content-between mb-2" v-if="couponDiscount > 0">
          <span>優惠折扣</span>
          <span>-${{ couponDiscount }}</span>
        </div>
        <div class="d-flex justify-content-between mb-2" v-if="deliveryFee > 0">
          <span>外送費</span>
          <span>${{ deliveryFee }}</span>
        </div>
        <div class="d-flex justify-content-between fw-bold">
          <span>總計</span>
          <span>${{ calculateTotal() }}</span>
        </div>
      </div>
    </div>

    <!-- Fixed Bottom Button -->
    <div v-if="cart.length > 0"
      class="checkout-button position-fixed bottom-0 start-25 w-100 bg-white p-3 shadow-lg d-flex justify-content-center"
      style="max-width: 768px;">
      <div class="container-button" style="max-width: 768px;">
        <button class="btn w-100 py-2 checkout-btn" @click="showConfirmation" :disabled="isSubmitDisabled">
          前往結帳 - ${{ calculateTotal() }}
        </button>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal fade" id="confirmOrderModal" tabindex="-1" aria-labelledby="confirmOrderModalLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="confirmOrderModalLabel">確認訂單</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>請確認您的訂單資訊：</p>
            <div class="mb-3">
              <strong>取餐方式：</strong> {{ formatPickupMethod() }}
              <span v-if="pickupMethod === 'dineIn'">（桌號：{{ tableNumber }}）</span>
              <div v-if="pickupMethod === 'delivery'" class="mt-2">
                <strong>外送地址：</strong> {{ deliveryAddress }}
              </div>
            </div>
            <div class="mb-3">
              <strong>取餐時間：</strong>
              {{ pickupTime === 'asap' ? '盡快取餐' : '預約時間：' + formatScheduledTime() }}
            </div>
            <div class="mb-3">
              <strong>付款方式：</strong> {{ formatPaymentMethod() }}
            </div>
            <div class="mb-3">
              <strong>總金額：</strong> ${{ calculateTotal() }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">返回修改</button>
            <button type="button" class="btn btn-primary" @click="submitOrder">確認送出</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/api';

const props = defineProps({
  cart: {
    type: Array,
    required: true
  },
  storeId: {
    type: String,
    required: true
  },
  removeFromCart: {
    type: Function,
    required: true
  },
  updateCartItemQuantity: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['goBack', 'editItem', 'orderSubmitted']);

const route = useRoute();
const router = useRouter();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Query parameters
const queryPickupMethod = route.query.pickupMethod;
const queryTable = route.query.table;

// State
const orderRemarks = ref('');
const selectedCoupon = ref('');
const pickupTime = ref('asap');
const scheduledTime = ref('');
const paymentMethod = ref('現金');
const confirmModal = ref(null);
const couponDiscount = ref(0);

// Pickup method state
const pickupMethod = ref(queryPickupMethod || 'selfPickup'); // Default to self-pickup
const tableNumber = ref(queryTable || ''); // For dine-in
const deliveryAddress = ref(''); // For delivery
const deliveryFee = ref(0); // Delivery fee

// Sample available coupons (would be fetched from API in real implementation)
const availableCoupons = ref([
  { id: 'coupon1', name: '新會員折扣', value: 50 },
  { id: 'coupon2', name: '生日特惠', value: 100 },
  { id: 'coupon3', name: '滿千折百', value: 100 }
]);

// Minimum pickup time (current time + 15 minutes)
const minPickupTime = computed(() => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 15);
  return date.toISOString().slice(0, 16);
});

// Check if submit button should be disabled
const isSubmitDisabled = computed(() => {
  if (pickupMethod.value === 'dineIn' && !tableNumber.value) {
    return true;
  }
  if (pickupMethod.value === 'delivery' && !deliveryAddress.value) {
    return true;
  }
  if (pickupTime.value === 'scheduled' && !scheduledTime.value) {
    return true;
  }
  return false;
});

const calculateSubtotal = () => {
  return props.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

const calculateTotal = () => {
  const subtotal = parseFloat(calculateSubtotal());
  return (subtotal - couponDiscount.value + deliveryFee.value);
};

const formatAddons = (addons) => {
  return addons.map(addon => addon.name).join(', ');
};

const formatAdditionalMeats = (additionalMeats) => {
  return additionalMeats.map(meat => meat.name).join(', ');
};

const formatPaymentMethod = () => {
  return '現場支付'
};

const formatPickupMethod = () => {
  const methods = {
    'dineIn': '內用',
    'selfPickup': '自取',
    'delivery': '外送'
  };
  return methods[pickupMethod.value] || pickupMethod.value;
};

const formatScheduledTime = () => {
  if (!scheduledTime.value) return '';

  try {
    const date = new Date(scheduledTime.value);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch (e) {
    return scheduledTime.value;
  }
};

const goBack = () => {
  emit('goBack');
};

const editItem = (index) => {
  emit('editItem', index);
};

const showConfirmation = () => {
  confirmModal.value.show();
};

const generateOrderNumber = async () => {
  try {
    const response = await api.order.getOrderNumber();
    return response.data.number;
  } catch (error) {
    console.error('獲取訂單編號失敗:', error);
    throw error; // 或者其他錯誤處理方式
  }
};

const isSubmitting = ref(false);

const submitOrder = async () => {
  if(isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    const orderItems = props.cart.map(item => ({
      itemModel: item.itemModel,
      itemId: item.id,
      amount: item.quantity,
      options: {
        doneness: item.doneness,
        sauce: item.sauce,
        addons: item.addons.map(a => a.id),
        extraOptions: item.extraOptions,
        additionalMeats: item.additionalMeats?.map(m => m.id) || [],
        remarks: item.remarks,
      },
      thisMoney: item.price * item.quantity
    }));

    // 計算商品的總金額 (不含折扣和運費)
    const itemsSubtotal = calculateSubtotal();
    
    // 計算最終總金額 (含折扣和運費)
    const finalTotal = calculateTotal();

    const pickupTimeValue = pickupTime.value === 'asap' ? null : scheduledTime.value;

    const orderData = {
      store: props.storeId,
      orderNumber: String(await generateOrderNumber()),
      platform: 'web',
      pickupMethod: formatPickupMethod(),
      paymentMethod: paymentMethod.value,
      orderAmount: itemsSubtotal, // 餐點總金額，不含折扣和運費
      pointsDiscount: couponDiscount.value, // 優惠券折扣
      deliveryFee: pickupMethod.value === 'delivery' ? deliveryFee.value : 0, // 運費
      totalMoney: finalTotal, // 最終總金額 (含折扣和運費)
      tableNumber: pickupMethod.value === 'dineIn' ? tableNumber.value : null,
      deliveryAddress: pickupMethod.value === 'delivery' ? deliveryAddress.value : null,
      items: orderItems,
      remarks: orderRemarks.value || null,
      scheduledPickupTime: pickupTimeValue,
      couponId: selectedCoupon.value || null
    };

    // console.log('Submitting order:', orderData);
    const { data: newOrder } = await api.order.create(orderData);
    
    confirmModal.value.hide();

    // Emit event that order was submitted
    emit('orderSubmitted', newOrder);

    // Redirect to confirmation page
    router.push(`/confirmation/${newOrder.id}`);
  } catch (error) {
    console.error('Error creating order:', error);
    alert('訂單建立失敗，請重試');
  }
};

// Watch for coupon selection
const updateCouponDiscount = () => {
  if (selectedCoupon.value) {
    const coupon = availableCoupons.value.find(c => c.id === selectedCoupon.value);
    if (coupon) {
      couponDiscount.value = coupon.value;
      return;
    }
  }
  couponDiscount.value = 0;
};

// Set delivery fee when pickup method changes
watch(pickupMethod, (newValue) => {
  if (newValue === 'delivery') {
    deliveryFee.value = 60; // Set a default delivery fee
  } else {
    deliveryFee.value = 0;
  }
});

// Initialize Bootstrap modal
const initModal = () => {
  // Import Bootstrap's modal JavaScript
  import('bootstrap/js/dist/modal').then(module => {
    const Modal = module.default;

    // Initialize confirmation modal
    const confirmOrderModalElement = document.getElementById('confirmOrderModal');
    if (confirmOrderModalElement) {
      confirmModal.value = new Modal(confirmOrderModalElement);
    }
  });
};

onMounted(() => {
  initModal();
  if (!scheduledTime.value) {
    scheduledTime.value = minPickupTime.value;
  }

  // Watch for coupon changes
  watch(selectedCoupon, updateCouponDiscount);
});
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 80px;
  /* Space for the fixed bottom button */
}

.cart-header {
  position: sticky;
  top: 0;
  z-index: 1000;
}

.divider {
  height: 8px;
  background-color: #f0f0f0;
  margin: 0;
  width: 100%
}

.cart-item {
  border-radius: 10px;
  overflow: hidden;
}

.quantity-control {
  min-width: 100px;
}

.quantity-control button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 50%;
}

.checkout-btn {
  border-radius: 8px;
  background-color: #7a5b0c;
  color: white;
  transition: background-color 0.3s;
}

.checkout-btn:hover:not(:disabled) {
  background-color: #4a7dde;
}

.checkout-btn:disabled {
  background-color: #b9cdf2;
  color: #ffffff;
}

.container-button {
  width: 100%;
  padding: 0 15px;
}

/* Fix for iOS input styling */
input[type="datetime-local"] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}
</style>