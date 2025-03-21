// 更新的路由配置，添加會員相關的路由

import { createRouter, createWebHistory } from 'vue-router'

// 引入原有的頁面
import AuthLoginView from '@/views/auth/loginView.vue'
import StaffOrder from '@/views/staff/index.vue'
import CustomerMenu from '@/views/customer/menu.vue'
import NotFound from '@/views/notFound.vue'
import DishAdd from '@/views/admin/dish/add.vue'
import DishEdit from '@/views/admin/dish/edit.vue'
import DishShow from '@/views/admin/dish/show.vue'
import MenuAdd from '@/views/admin/menu/add.vue'
import MenuShow from '@/views/admin/menu/show.vue'
import MenuEdit from '@/views/admin/menu/edit.vue'
import AdminIndex from '@/views/admin/index.vue'
import StoreAdd from '@/views/admin/store/add.vue'
import StoreShow from '@/views/admin/store/show.vue'
import StoreEdit from '@/views/admin/store/edit.vue'
import Confirmation from '@/views/customer/confirmation.vue'

// 引入新的會員相關頁面
import CustomerLoginView from '@/views/customer/loginView.vue'
import CustomerLoginForm from '@/components/Customer/LoginForm.vue'
import CustomerLoginPassword from '@/components/Customer/LoginPassword.vue'
import CustomerRegister from '@/components/Customer/Register.vue'
import CustomerForgotPassword from '@/components/Customer/ForgotPassword.vue'
import CustomerMyAccount from '@/views/customer/myAccount.vue'
import CustomerAccountHome from '@/components/Customer/AccountHome.vue'
import CustomerAccountEdit from '@/components/Customer/AccountEdit.vue'
import CustomerPasswordEdit from '@/components/Customer/PasswordEdit.vue'
import CustomerPoints from '@/components/Customer/Points.vue'
import CustomerCoupons from '@/components/Customer/Coupons.vue'
import CustomerOrders from '@/components/Customer/Orders.vue'
import CustomerOrdering from '@/views/customer/ordering.vue'

import api from '@/api'

const isLoggedIn = async () => {
  try {
    const response = await api.auth.getCurrentUser();
    return response.data.loggedIn;
  } catch (error) {
    console.error('檢查登入狀態失敗', error);
    return false;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 原有路由
    {
      path: '/login',
      name: 'login',
      component: AuthLoginView, // 管理員登入頁面
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminIndex,
      meta: { requiresAuth: false }, // 需要登入
      children: [
        // 餐點管理相關路由
        {
          path: 'dish/add',
          name: 'admin-dish-add',
          component: DishAdd,
        },
        {
          path: 'dish/show',
          name: 'admin-dish-show',
          component: DishShow,
        },
        {
          path: 'dish/:type/:id',
          name: 'admin-dish-edit',
          component: DishEdit,
        },
        // 菜單管理相關路由
        {
          path: 'menu/add',
          name: 'admin-menu-add',
          component: MenuAdd,
        },
        {
          path: 'menu/show',
          name: 'admin-menu-show',
          component: MenuShow,
        },
        {
          path: 'menu/:id',
          name: 'admin-menu-edit',
          component: MenuEdit,
        },
        // 店家管理相關路由
        {
          path: 'store/add',
          name: 'admin-store-add',
          component: StoreAdd,
        },
        {
          path: 'store/show',
          name: 'admin-store-show',
          component: StoreShow,
        },
        {
          path: 'store/:id',
          name: 'admin-store-edit',
          component: StoreEdit,
        },
        // 訂單列表相關路由
        {
          path: 'orders',
          name: 'admin-orders',
          component: () => import('@/views/admin/order/list.vue'),
        },
        {
          path: 'orders/:date',
          name: 'admin-orders-detail',
          component: () => import('@/views/admin/order/detail.vue'),
        }
      ],
    },
    {
      path: '/staff/:storeId',
      name: 'staff',
      component: StaffOrder,
      meta: { requiresAuth: false }, // 需要登入
    },
    {
      path: '/confirmation/:orderId',
      name: 'confirmation',
      component: Confirmation,
    },
    
    // 新增會員相關路由
    {
      path: '/customer/login',
      name: 'customer-login',
      component: CustomerLoginView,
      children: [
        {
          path: '',
          name: 'customer-login-form',
          component: CustomerLoginForm,
        },
        {
          path: 'password',
          name: 'customer-login-password',
          component: CustomerLoginPassword,
        },
        {
          path: 'register',
          name: 'customer-register',
          component: CustomerRegister,
        },
        {
          path: 'forgot-password',
          name: 'customer-forgot-password',
          component: CustomerForgotPassword,
        }
      ]
    },
    {
      path: '/customer/my-account',
      name: 'customer-my-account',
      component: CustomerMyAccount,
      meta: { requiresCustomerAuth: true },
      children: [
        {
          path: '',
          name: 'customer-account-home',
          component: CustomerAccountHome,
        },
        {
          path: 'edit',
          name: 'customer-account-edit',
          component: CustomerAccountEdit,
        },
        {
          path: 'password/edit',
          name: 'customer-password-edit',
          component: CustomerPasswordEdit,
        },
        {
          path: 'points',
          name: 'customer-points',
          component: CustomerPoints,
        },
        {
          path: 'coupons',
          name: 'customer-coupons',
          component: CustomerCoupons,
        },
        {
          path: 'orders',
          name: 'customer-orders',
          component: CustomerOrders,
        }
      ]
    },
    {
      path: '/customer/ordering/:store_id',
      name: 'customer-ordering',
      component: CustomerOrdering,
    },
    
    // 重新導向舊的顧客路由到新的線上點餐入口
    {
      path: '/customer/:store',
      name: 'menu',
      component: CustomerMenu,
    },
    
    // 404 頁面
    {
      path: '/:pathMatch(.*)*',
      name: "NotFound",
      component: NotFound
    }
  ],
})

// 全局前置守衛
router.beforeEach(async (to, from, next) => {
  // 管理員授權檢查
  if (to.meta.requiresAuth) {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    }
  }
  
  // 會員授權檢查
  if (to.meta.requiresCustomerAuth) {
    const isCustomerLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isCustomerLoggedIn) {
      return next({
        path: '/customer/login',
        query: { redirect: to.fullPath }
      });
    }
  }
  
  next();
});

export default router