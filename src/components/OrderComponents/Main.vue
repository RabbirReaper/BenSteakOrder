<!-- MenuListing.vue -->
<template>
  <div>
    <div class="nav-container">
      <div class="nav-wrapper autohide">
        <nav class="navbar navbar-expand-lg navbar-light">
          <div class="container-fluid">
            <a class="navbar-brand" href="#" style="font-weight: bold;">奔野牛排 {{ storeName }}</a>
            <a class="nav-link" href="#"> Menu item </a>
          </div>
        </nav>
        <div class="nav-border"></div>
      </div>
    </div>
    <div class="content-wrapper" style="padding: 0;">
      <img style="max-height: 200px; width: 100%; padding: 0;"
        :src="storeImage && storeImage.url"
        :alt="storeImage && storeImage.alt ? storeImage.alt : '店家圖片'">
    </div>
    <div class="content-wrapper mt-4">
      <h3 class="fw-bold">奔野牛排 {{ storeName }}</h3>
      <p>營業時間： 早上：11:30 ~ 13:30 晚上：5:00 ~ 8:30</p>
    </div>
    <div class="nav-border"></div>
    <div v-if="announcements" class="content-wrapper mt-4">
      <h3 class="fw-bold">公告：</h3>
      <div v-for="(announcement, index) in announcements" :key="announcement._id">
        <div class="mt-3">
          <h5 class="mb-2 fw-bold">{{ announcement.title }}</h5>
          <p class="mb-0">{{ announcement.content }}</p>
        </div>
        <hr v-if="index < announcements.length - 1" class="my-2">
      </div>
    </div>

    <div class="nav-border mt-4"></div>
    <div v-if="menuList" class="content-wrapper mt-4">
      <h3 class="fw-bold">菜單：</h3>
      <div v-for="category in menuList" :key="category._id">
        <h4 class="fw-bold mt-3">{{ category.categoryName }}</h4>
        <div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
          <div v-for="item in getItemsInCategory(category)" :key="item._id" class="col">
            <div class="card h-100 shadow-sm" @click="$emit('select-item', item)">
              <div class="card-img-top" style="aspect-ratio: 1/1; overflow: hidden;">
                <img :src="item.image?.url || '/placeholder.jpg'" :alt="item.name" class="w-100 h-100"
                  style="object-fit: cover;">
              </div>
              <div class="card-body p-2">
                <h5 class="card-title fs-6">{{ item.name }}</h5>
                <p class="card-text text-danger fw-bold mb-0">${{ item.price }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="nav-border mt-4" style="height: 2px;"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

const props = defineProps({
  storeName: {
    type: String,
    required: true,
    default: ''
  },
  announcements: {
    type: Array,
    required: true,
    default: () => []
  },
  menuList: {
    type: Array,
    required: true,
    default: () => []
  },
  menuItems: {
    type: Array,
    required: true,
    default: () => []
  },
  storeImage: {
    type: Object,
    default: () => null
  }
});

const emit = defineEmits(['select-item']);

const getItemsInCategory = (category) => {
  return props.menuItems.filter(item => {
    return category.items.some(catItem => catItem.itemId === item._id);
  }).sort((a, b) => {
    const aOrder = category.items.find(item => item.itemId === a._id)?.order || 0;
    const bOrder = category.items.find(item => item.itemId === b._id)?.order || 0;
    return aOrder - bOrder;
  });
};

const navbarInit = () => {
  const el_autohide = document.querySelector('.autohide')

  const navbar_height = document.querySelector('.navbar').offsetHeight + 1
  document.querySelector('.content-wrapper').style.paddingTop = `${navbar_height}px`

  if (el_autohide) {
    let last_scroll_top = 0

    const scrollHandler = () => {
      const scroll_top = window.scrollY

      if (scroll_top > navbar_height) {
        if (scroll_top < last_scroll_top) {
          el_autohide.classList.remove('scrolled-down')
          el_autohide.classList.add('scrolled-up')
        } else {
          el_autohide.classList.remove('scrolled-up')
          el_autohide.classList.add('scrolled-down')
        }
      }

      last_scroll_top = scroll_top
    }

    window.addEventListener('scroll', scrollHandler)

    onUnmounted(() => {
      window.removeEventListener('scroll', scrollHandler)
    })
  }
}

onMounted(() => {
  navbarInit()
})
</script>

<style scoped>
.nav-container {
  position: fixed;
  top: 0;
  width: 100%;
  max-width: 768px;
  z-index: 1030;
  left: 50%;
  transform: translateX(-50%);
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

.scrolled-down {
  transform: translateY(-100%);
  transition: all 0.3s ease-in-out;
}

.scrolled-up {
  transform: translateY(0);
  transition: all 0.3s ease-in-out;
}

.content-wrapper {
  width: 100%;
  padding: 0 15px;
}

.card {
  cursor: pointer;
}
</style>