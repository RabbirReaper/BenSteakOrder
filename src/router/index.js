import { createRouter, createWebHistory } from 'vue-router'

// 引入頁面
import LoginView from '../views/LoginView.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import StaffOrder from '../views/staff/StaffOrder.vue'
import CustomerMenu from '../views/customer/CustomerMenu.vue'

// // 假設的檢查登入狀態函數
// const isLoggedIn = () => {
//   // 實際應該從你的登入狀態中判斷，比如檢查 Token 是否存在
//   return localStorage.getItem('authToken') !== null
// }

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
  ],
})

// // 全局前置守衛
// router.beforeEach((to, from, next) => {
//   // 如果路由需要登入，且未登入，則跳轉到 /login
//   if (to.meta.requiresAuth && !isLoggedIn()) {
//     next({ path: '/login' }) // 跳轉到登入頁面
//   } else {
//     next() // 繼續導航
//   }
// })

export default router
