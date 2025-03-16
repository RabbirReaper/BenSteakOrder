<!-- MenuListing.vue -->
<template>
  <div class="menu-listing">
    <!-- 固定導航欄 -->
    <div class="nav-container">
      <div class="nav-wrapper autohide">
        <nav class="navbar navbar-expand-lg navbar-light">
          <div class="container-fluid">
            <a class="navbar-brand" href="#" style="font-weight: bold;">
              <i class="bi bi-fire brand-icon me-2"></i>奔野牛排 {{ storeName }}
            </a>
            <div class="nav-icons">
              <a class="nav-icon" href="#">
                <i class="bi bi-person-circle"></i>
                <span class="login-text">登入</span>
              </a>
            </div>
          </div>
        </nav>
        <div class="nav-border"></div>
      </div>
    </div>

    <!-- 店家主圖 -->
    <div class="banner-container">
      <div class="content-wrapper p-0">
        <div class="store-banner">
          <img :src="storeImage && storeImage.url" :alt="storeImage && storeImage.alt ? storeImage.alt : '店家圖片'"
            class="banner-img">
          <div class="banner-overlay"></div>
          <div class="banner-content">
            <h1 class="banner-title">奔野牛排 {{ storeName }}</h1>
            <p class="banner-subtitle">優質美食，精心烹調</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 店家資訊 -->
    <div class="store-info-container">
      <div class="content-wrapper">
        <div class="store-info-card">
          <div class="store-info-item">
            <i class="bi bi-clock info-icon"></i>
            <div>
              <h6 class="mb-1">營業時間</h6>
              <p class="mb-0">午間：11:30 ~ 13:30</p>
              <p class="mb-0">晚間：17:00 ~ 20:30</p>
            </div>
          </div>
          <div class="divider-vertical"></div>
          <div class="store-info-item">
            <i class="bi bi-geo-alt location-icon"></i>
            <div>
              <h6 class="mb-1">地點</h6>
              <p class="mb-0">{{ storeName }} 分店</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 公告區塊 -->
    <div v-if="announcements && announcements.length > 0" class="announcement-container">
      <div class="content-wrapper">
        <div class="section-header">
          <i class="bi bi-megaphone-fill me-2 announcement-icon"></i>
          <h3 class="fw-bold mb-0">最新公告</h3>
        </div>
        <div class="announcement-list">
          <div v-for="(announcement, index) in announcements" :key="index" class="announcement-card">
            <h5 class="announcement-title">{{ announcement.title }}</h5>
            <p class="announcement-content">{{ announcement.content }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 菜單區塊 -->
    <div id="menu-section" class="menu-container">
      <div class="content-wrapper">
        <div class="section-header">
          <i class="bi bi-journal-text me-2 menu-icon"></i>
          <h3 class="fw-bold mb-0">精選菜單</h3>
        </div>

        <div v-for="category in menuList" :key="category._id" class="menu-category">
          <div class="category-header">
            <h4 class="fw-bold">{{ category.categoryName }}</h4>
          </div>
          <div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
            <div v-for="item in getItemsInCategory(category)" :key="item._id" class="col">
              <div class="menu-item-card" @click="$emit('select-item', item)">
                <div class="item-img-container">
                  <img :src="item.image?.url || '/placeholder.jpg'" :alt="item.name" class="item-img">
                  <div class="item-img-overlay"></div>
                </div>
                <div class="item-content">
                  <h5 class="item-title">{{ item.name }}</h5>
                  <p class="item-desc" v-if="item.description">{{ truncateDescription(item.description, 30) }}</p>
                  <div class="item-price-tag">
                    <span>${{ item.price }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 頁腳 -->
    <div class="footer">
      <p class="text-center mb-0">© 2025 奔野牛排 • 美味與品質的保證</p>
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

// 取得分類中的菜單項目並排序
const getItemsInCategory = (category) => {
  return props.menuItems.filter(item => {
    return category.items.some(catItem => catItem.itemId === item._id);
  }).sort((a, b) => {
    const aOrder = category.items.find(item => item.itemId === a._id)?.order || 0;
    const bOrder = category.items.find(item => item.itemId === b._id)?.order || 0;
    return aOrder - bOrder;
  });
};

// 截斷過長的描述文字
const truncateDescription = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// 導航欄滾動效果初始化
const navbarInit = () => {
  const el_autohide = document.querySelector('.autohide');
  if (!el_autohide) return;

  const navbar_height = document.querySelector('.navbar').offsetHeight + 1;
  const contentWrappers = document.querySelectorAll('.content-wrapper');
  contentWrappers.forEach(wrapper => {
    if (wrapper.style.paddingTop === '') {
      wrapper.style.paddingTop = `${navbar_height}px`;
    }
  });

  let last_scroll_top = 0;
  const scrollHandler = () => {
    const scroll_top = window.scrollY;

    if (scroll_top > navbar_height) {
      if (scroll_top < last_scroll_top) {
        el_autohide.classList.remove('scrolled-down');
        el_autohide.classList.add('scrolled-up');
      } else {
        el_autohide.classList.remove('scrolled-up');
        el_autohide.classList.add('scrolled-down');
      }
    }

    last_scroll_top = scroll_top;
  };

  window.addEventListener('scroll', scrollHandler);

  onUnmounted(() => {
    window.removeEventListener('scroll', scrollHandler);
  });
};

onMounted(() => {
  navbarInit();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap');

/* 自定義變數，直接在選擇器內部定義 */
.menu-listing {
  /* 顏色變數定義 */
  --primary-color: #d35400;
  --accent-color: #e67e22;
  --text-color: #2c3e50;
  --bg-light: #f8f9fa;
  --price-color: #dceeda;
}

/* 導航欄樣式 */
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.navbar {
  width: 100%;
  background-color: #ffffff;
  margin-bottom: 0;
  padding: 0.8rem 1rem;
}

.navbar-brand {
  font-size: 1.3rem;
  color: var(--primary-color) !important;
  font-weight: 700 !important;
}

.brand-icon {
  color: #d21313;
}

.nav-icons {
  display: flex;
  align-items: center;
}

.nav-icon {
  color: var(--text-color);
  font-size: 1.2rem;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
}

.nav-icon:hover {
  background-color: var(--primary-color);
  color: white;
}

.login-text {
  font-size: 0.9rem;
  font-weight: 500;
}

.nav-border {
  height: 3px;
  background: linear-gradient(to right, var(--primary-color), var(--accent-color));
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

/* 店家主圖橫幅 */
.banner-container {
  margin-top: 60px;
}

.store-banner {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6));
}

.banner-content {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  color: white;
}

.banner-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 5px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.banner-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: 500;
}

/* 店家信息卡片 */
.store-info-container {
  margin-top: -30px;
  padding-bottom: 1rem;
}

.store-info-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin: 0 0.5rem;
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
}

.store-info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
}

.store-info-item i {
  font-size: 1.5rem;
  margin-top: 0.2rem;
}

.info-icon {
  color: #007bff;
}

.location-icon {
  color: #dc3545;
}

.divider-vertical {
  width: 1px;
  height: 50px;
  background-color: #e9ecef;
}

/* 公告樣式 */
.announcement-container {
  padding: 2rem 0;
  background-color: #f8f9fa;
}

.announcement-icon {
  color: #ffc107;
}

.menu-icon {
  color: #28a745;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--accent-color);
}

.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.announcement-card {
  background-color: white;
  border-radius: 10px;
  padding: 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid var(--accent-color);
}

.announcement-title {
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.announcement-content {
  color: var(--text-color);
  margin-bottom: 0;
  font-size: 0.95rem;
}

/* 菜單樣式 */
.menu-container {
  padding: 2rem 0;
}

.menu-category {
  margin-bottom: 2.5rem;
}

.category-header {
  margin-bottom: 1rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  border-bottom: 1px dashed #e0e0e0;
  padding-bottom: 0.5rem;
}

.category-decorator {
  width: 50px;
  height: 24px;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  border-radius: 6px 0 0 6px;
  position: relative;
  margin-right: -1px;
}

.category-decorator:after {
  content: '';
  position: absolute;
  top: 0;
  right: -10px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 12px 0 12px 10px;
  border-color: transparent transparent transparent var(--accent-color);
}

.category-header h4 {
  font-family: 'Noto Sans TC', '微軟正黑體', 'Microsoft JhengHei', '蘋方-繁', 'PingFang TC', sans-serif !important;
  font-weight: 700 !important;
  color: var(--primary-color);
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  position: relative;
  padding-left: 15px;
}

.category-header h4:before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 24px;
  background-color: var(--accent-color);
  border-radius: 3px;
}

.menu-item-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.menu-item-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.item-img-container {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.menu-item-card:hover .item-img {
  transform: scale(1.08);
}

.item-img-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent);
}

.item-content {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.item-title {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-color);
  margin-bottom: 0.4rem;
  transition: color 0.2s;
}

.menu-item-card:hover .item-title {
  color: var(--primary-color);
}

.item-desc {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
  flex-grow: 1;
}

.item-price-tag {
  display: inline-block;
  background-color: var(--price-color);
  color: rgb(185, 127, 68);
  font-weight: 700;
  font-size: 1.1rem;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  box-shadow: 0 2px 5px rgba(199, 181, 181, 0.1);
  align-self: flex-end;
}

/* 頁腳 */
.footer {
  background-color: rgba(218, 20, 20, 0.692);
  color: white;
  padding: 1rem 0;
}

/* 響應式調整 */
@media (max-width: 767px) {
  .store-banner {
    height: 220px;
  }

  .banner-title {
    font-size: 1.7rem;
  }

  .store-info-card {
    flex-direction: column;
    gap: 1.5rem;
    align-items: flex-start;
  }

  .divider-vertical {
    width: 100%;
    height: 1px;
    margin: 0.5rem 0;
  }
}

.content-wrapper {
  width: 100%;
  padding: 0 15px;
}
</style>