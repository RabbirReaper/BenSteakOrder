<template>
  <div class="container py-4">
    <h1 class="mb-4">餐點管理</h1>

    <!-- 導航頁籤 -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <router-link 
          :to="{ name: 'admin-dish-template' }" 
          class="nav-link" 
          :class="{ active: activeTab === 'template' }"
        >
          餐點模板
        </router-link>
      </li>
      <li class="nav-item">
        <router-link 
          :to="{ name: 'admin-combo-template' }" 
          class="nav-link" 
          :class="{ active: activeTab === 'combo' }"
        >
          套餐
        </router-link>
      </li>
      <li class="nav-item">
        <router-link 
          :to="{ name: 'admin-option-category' }" 
          class="nav-link" 
          :class="{ active: activeTab === 'option' }"
        >
          選項管理
        </router-link>
      </li>
    </ul>

    <!-- 子路由內容 -->
    <router-view></router-view>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// 根據當前路由判斷選中的頁籤
const activeTab = computed(() => {
  const name = route.name;
  if (name.startsWith('admin-dish-template')) return 'template';
  if (name.startsWith('admin-combo-template')) return 'combo';
  if (name.startsWith('admin-option')) return 'option';
  return '';
});
</script>