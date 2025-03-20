<template>
  <div class="main-container">
    <div class="center-container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
// 這是一個容器組件，用於處理會員專區相關的路由視圖
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