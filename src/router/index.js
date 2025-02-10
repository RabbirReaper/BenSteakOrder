import { createRouter, createWebHistory } from 'vue-router'

// 引入頁面
import LoginView from '../views/LoginView.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import StaffOrder from '../views/staff/StaffOrder.vue'
import CustomerMenu from '../views/customer/CustomerMenu.vue'
import NotFound from '../views/NotFound.vue'
import axios from 'axios';

const isLoggedIn = async () => {
  try {
    const response = await axios.get('/api/current_user');
    return response.data.loggedIn;
  } catch (error) {
    console.error('檢查登入狀態失敗', error);
    return false;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView, // 登入頁面
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboard,
      meta: { requiresAuth: true }, // 需要登入
      // children: [

      // ]
    },
    {
      path: '/staff',
      name: 'staff',
      component: StaffOrder,
      meta: { requiresAuth: true }, // 需要登入
    },
    {
      path: '/customer',
      name: 'customer',
      component: CustomerMenu,
    },
    {
      path: '/:pathMatch(.*)*',
      name: "NotFound",
      component: NotFound
    }
  ],
})

// // 全局前置守衛
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    }
  }
  next();
});

export default router
