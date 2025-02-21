<template>
  <div class="container py-4">
    <OrderHeader 
      :store-name="store.name"
      v-model="orderType"
      v-model:table-number="tableNumber"
    />
    
    <CategoryMenu 
      :categories="sortedCategories"
      v-model="activeCategory"
    />
    
    <MenuItems 
      :categories="sortedCategories"
      :menu-items="menuItems"
      :active-category="activeCategory"
      @select-item="openItemDetails"
    />
    
    <ItemDetailsModal
      v-model:selectedItem="selectedItem"
      :addon-items="addonItems"
      @add-to-cart="addToCart"
    />
    
    <ShoppingCart
      v-model="cart"
      :order-type="orderType"
      :table-number="tableNumber"
      @checkout="checkout"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import OrderHeader from '../../components/OrderComponents/OrderHeader.vue';
import CategoryMenu from '../../components/OrderComponents/CategoryMenu.vue';
import MenuItems from '../../components/OrderComponents/MenuItems.vue';
import ItemDetailsModal from '../../components/OrderComponents/ItemDetailsModal.vue';
import ShoppingCart from '../../components/OrderComponents/ShoppingCart.vue';

const route = useRoute();
const router = useRouter();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Store and routing related state
const storeId = route.params.store;
const queryOrderType = route.query.orderType;
const queryTable = route.query.table;

// Core state
const store = ref({});
const menu = ref(null);
const menuItems = ref([]);
const addonItems = ref([]);
const orderType = ref(queryOrderType || 'dineIn');
const tableNumber = ref(queryTable || '');
const activeCategory = ref('all');
const selectedItem = ref(null);
const cart = ref([]);

// Computed properties
const sortedCategories = computed(() => {
  if (!menu.value?.list) return [];
  return [...menu.value.list].sort((a, b) => a.order - b.order);
});

// API calls
const fetchStoreAndMenu = async () => {
  try {
    // Fetch store data
    const { data: storeData } = await axios.get(`${API_BASE_URL}/store/${storeId}`);
    store.value = storeData;

    if (storeData.menuItem) {
      menu.value = storeData.menuItem;

      // Create mapping for item models
      const dishModelMapping = {};
      menu.value.list.forEach(category => {
        category.items.forEach(item => {
          dishModelMapping[item.itemId] = item.itemModel;
        });
      });

      // Fetch all menu items
      const itemPromises = menu.value.list.flatMap(category =>
        category.items.map(item => 
          axios.get(`${API_BASE_URL}/dish/${item.itemModel.charAt(0).toLowerCase() + item.itemModel.slice(1)}/${item.itemId}`)
        )
      );

      const itemResponses = await Promise.all(itemPromises);
      menuItems.value = itemResponses.map(response => ({
        ...response.data,
        itemModel: dishModelMapping[response.data._id]
      }));

      // Fetch addon items
      const { data: addons } = await axios.get(`${API_BASE_URL}/dish/addon`);
      addonItems.value = addons;
    }
  } catch (error) {
    console.error('Error fetching store and menu:', error);
    // You might want to add error handling UI here
  }
};

const generateOrderNumber = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/order/number`);
    return data;
  } catch (error) {
    console.error('Error generating order number:', error);
    throw error;
  }
};

// Event handlers
const openItemDetails = (item) => {
  selectedItem.value = item;
};

const addToCart = (item) => {
  cart.value.push(item);
};

const checkout = async () => {
  try {
    // Validate checkout conditions
    if (orderType.value === 'dineIn' && !tableNumber.value) {
      alert('請輸入桌號');
      return;
    }

    // Prepare order items
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
    const orderAmount = parseFloat(
      cart.value.reduce((total, item) => total + (item.price * item.quantity), 0)
        .toFixed(2)
    );

    // Prepare order data
    const orderData = {
      store: storeId,
      orderNumber: await generateOrderNumber(),
      platform: 'web',
      pickupMethod: orderType.value === 'dineIn' ? '內用' : '外帶',
      paymentMethod: 'store',
      orderAmount,
      totalPaid: orderAmount,
      tableNumber: orderType.value === 'dineIn' ? tableNumber.value : null,
      items: orderItems,
      remarks: cart.value.some(item => item.remarks)
        ? cart.value.map(item => item.remarks).filter(Boolean).join(' / ')
        : null
    };

    // Create order
    const { data: newOrder } = await axios.post(`${API_BASE_URL}/order`, orderData);
    
    // Redirect to confirmation page
    router.push(`/customer/confirmation/${newOrder._id}`);
  } catch (error) {
    console.error('Error creating order:', error);
    alert('訂單建立失敗，請重試');
  }
};

// Watchers
watch(() => route.params.store, (newStoreId) => {
  if (newStoreId !== storeId) {
    fetchStoreAndMenu();
  }
});

// Lifecycle hooks
onMounted(() => {
  fetchStoreAndMenu();
});
</script>