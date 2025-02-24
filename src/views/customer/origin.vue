<template>
  <div class="main-container">
    <div class="center-container">
      <MenuListing
        v-if="!selectedItem"
        :store-name="store.name"
        :announcements="store.announcements"
        :menu-list="menu.list"
        :menu-items="menuItems"
        @select-item="openItemDetails"
      />
      <div v-else>
        {{ selectedItem }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router';
import axios from 'axios';
import MenuListing from '@/components/OrderComponents/Main.vue'

const route = useRoute();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const storeId = route.params.store;
const queryOrderType = route.query.orderType;
const queryTable = route.query.table;

const store = ref({})
const menu = ref({})
const menuItems = ref([]);
const addonItems = ref([]);
const orderType = ref(queryOrderType || 'dineIn');
const tableNumber = ref(queryTable || '0');

const selectedItem = ref()

const fetchStore = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/store/${storeId}`);
    store.value = response.data;
    console.log(store.value)
  } catch (error) {
    console.error('Error fetching store :', error);
  }
}

const fetchMenu = async () => {
  menu.value = store.value.menuItem
  console.log('menu', menu.value)

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

  console.log('menuItems', menuItems.value);
  const { data: addons } = await axios.get(`${API_BASE_URL}/dish/addon`);
  addonItems.value = addons;
}

const openItemDetails = (item) => {
  selectedItem.value = item
  console.log(item)
}

onMounted(async () => {
  selectedItem.value = null
  await fetchStore()
  await fetchMenu()
})
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
</style>