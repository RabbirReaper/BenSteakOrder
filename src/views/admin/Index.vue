<template>
  <div class="d-flex">
    <!-- Sidebar -->
    <div class="sidebar bg-dark">
      <router-link to="/admin" class="d-flex align-items-center mb-3 mb-md-0 px-3 text-white text-decoration-none">
        <svg class="bi pe-none me-2" width="40" height="32">
          <use xlink:href="#bootstrap" />
        </svg>
        <span class="fs-4">Sidebar</span>
      </router-link>
      <hr class="text-white" />
      <ul class="nav nav-pills flex-column">
        <li class="nav-item">
          <router-link to="/admin/dish/show" class="nav-link text-white">
            Dish show
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/admin/menu/show" class="nav-link text-white">
            Menu show
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/admin/store/show" class="nav-link text-white">
            Store show
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/admin/orders" class="nav-link text-white">
            訂單列表
          </router-link>
        </li>
      </ul>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
// 這裡可以加入需要的邏輯
</script>

<style scoped>
.sidebar {
  width: 280px;
  min-height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  padding: 1rem;
}

.main-content {
  margin-left: 280px;
  padding: 1rem;
  width: calc(100% - 280px);
  min-height: 100vh;
}

.nav-link {
  padding: 0.5rem 1rem;
  margin: 0.2rem 0;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  background-color: #0d6efd;
}
</style>