import { createRouter, createWebHistory } from 'vue-router'

// 保留直接引入的兩個路由組件
import StaffOrder from '@/views/staff/index.vue'
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

// 檢查登入狀態和用戶角色
const checkAuth = async () => {
  try {
    const response = await api.auth.getCurrentUser();
    return {
      loggedIn: response.data.loggedIn,
      role: response.data.role,
      storeId: response.data.store_id
    };
  } catch (error) {
    console.error('檢查登入狀態失敗', error);
    return { loggedIn: false, role: null, storeId: null };
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 原有路由
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/loginView.vue'), // 管理員登入頁面
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/index.vue'),
      meta: { requiresAuth: false, role: 'super_admin' }, // 需要登入
      children: [
        // 餐點管理相關路由
        {
          path: 'dish/add',
          name: 'admin-dish-add',
          component: () => import('@/views/admin/dish/add.vue'),
        },
        {
          path: 'dish/show',
          name: 'admin-dish-show',
          component: () => import('@/views/admin/dish/show.vue'),
        },
        {
          path: 'dish/:type/:id',
          name: 'admin-dish-edit',
          component: () => import('@/views/admin/dish/edit.vue'),
        },
        // 菜單管理相關路由
        {
          path: 'menu/add',
          name: 'admin-menu-add',
          component: () => import('@/views/admin/menu/add.vue'),
        },
        {
          path: 'menu/show',
          name: 'admin-menu-show',
          component: () => import('@/views/admin/menu/show.vue'),
        },
        {
          path: 'menu/:id',
          name: 'admin-menu-edit',
          component: () => import('@/views/admin/menu/edit.vue'),
        },
        // 店家管理相關路由
        {
          path: 'store/add',
          name: 'admin-store-add',
          component: () => import('@/views/admin/store/add.vue'),
        },
        {
          path: 'store/show',
          name: 'admin-store-show',
          component: () => import('@/views/admin/store/show.vue'),
        },
        {
          path: 'store/:id',
          name: 'admin-store-edit',
          component: () => import('@/views/admin/store/edit.vue'),
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
        },
        // 促銷管理相關路由
        {
          path: 'promotion',
          name: 'admin-promotion',
          component: () => import('@/views/admin/promotion/index.vue'),
        },
        {
          path: 'dish-management',
          name: 'admin-dish-management',
          component: () => import('@/views/admin/dish-management/index.vue'),
          meta: { requiresAuth: false, role: 'super_admin' },
          children: [
            // 餐點模板管理
            {
              path: 'template',
              name: 'admin-dish-template',
              component: () => import('@/views/admin/dish-management/template/index.vue'),
            },
            {
              path: 'template/:id',
              name: 'admin-dish-template-edit',
              component: () => import('@/views/admin/dish-management/template/edit.vue'),
            },
            // 套餐管理
            {
              path: 'combo',
              name: 'admin-combo-template',
              component: () => import('@/views/admin/dish-management/combo/index.vue'),
            },
            {
              path: 'combo/:id',
              name: 'admin-combo-template-edit',
              component: () => import('@/views/admin/dish-management/combo/edit.vue'),
            },
            // 選項管理
            {
              path: 'option',
              name: 'admin-option-category',
              component: () => import('@/views/admin/dish-management/option/category.vue'),
            },
            {
              path: 'option/:id',
              name: 'admin-option-edit',
              component: () => import('@/views/admin/dish-management/option/edit.vue'),
            }
          ]
        },
      ],
    },
    {
      path: '/staff/:storeId',
      name: 'staff',
      component: StaffOrder,
      meta: { requiresAuth: false, role: 'store_admin' }, // 需要登入
    },
    {
      path: '/confirmation/:orderId',
      name: 'confirmation',
      component: () => import('@/views/customer/confirmation.vue'),
    },

    // 新增會員相關路由
    {
      path: '/customer/login',
      name: 'customer-login',
      component: () => import('@/views/customer/loginView.vue'),
      children: [
        {
          path: '',
          name: 'customer-login-form',
          component: () => import('@/components/Customer/LoginForm.vue'),
        },
        {
          path: 'password',
          name: 'customer-login-password',
          component: () => import('@/components/Customer/LoginPassword.vue'),
        },
        {
          path: 'register',
          name: 'customer-register',
          component: () => import('@/components/Customer/Register.vue'),
        },
        {
          path: 'forgot-password',
          name: 'customer-forgot-password',
          component: () => import('@/components/Customer/ForgotPassword.vue'),
        }
      ]
    },
    {
      path: '/customer/my-account',
      name: 'customer-my-account',
      component: () => import('@/views/customer/myAccount.vue'),
      meta: { requiresCustomerAuth: true },
      children: [
        {
          path: '',
          name: 'customer-account-home',
          component: () => import('@/components/Customer/AccountHome.vue'),
        },
        {
          path: 'edit',
          name: 'customer-account-edit',
          component: () => import('@/components/Customer/AccountEdit.vue'),
        },
        {
          path: 'password/edit',
          name: 'customer-password-edit',
          component: () => import('@/components/Customer/PasswordEdit.vue'),
        },
        {
          path: 'points',
          name: 'customer-points',
          component: () => import('@/components/Customer/Points.vue'),
        },
        {
          path: 'coupons',
          name: 'customer-coupons',
          component: () => import('@/components/Customer/Coupons.vue'),
        },
        {
          path: 'orders',
          name: 'customer-orders',
          component: () => import('@/components/Customer/Orders.vue'),
        }
      ]
    },
    {
      path: '/customer/ordering/:store_id',
      name: 'customer-ordering',
      component: CustomerOrdering,
    },

    // 404 頁面
    {
      path: '/:pathMatch(.*)*',
      name: "NotFound",
      component: () => import('@/views/notFound.vue')
    }
  ],
})

// 全局前置守衛
router.beforeEach(async (to, from, next) => {
  // 管理員授權檢查
  if (to.meta.requiresAuth) {
    const { loggedIn, role, storeId } = await checkAuth();

    if (!loggedIn) {
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    }

    // 檢查角色權限
    if (to.meta.role === 'super_admin' && role !== 'super_admin') {
      alert('您沒有權限訪問此頁面');
      return next('/login');
    }

    // 檢查店家管理員是否訪問自己的店鋪
    if (to.meta.role === 'store_admin') {
      // 如果是超級管理員，允許訪問任何店鋪
      if (role === 'super_admin') {
        return next();
      }

      // 店家管理員只能訪問自己的店鋪
      const requestedStoreId = to.params.storeId;
      if (role === 'store_admin' && storeId !== requestedStoreId) {
        alert('您沒有權限管理此店鋪');
        return next('/login');
      }
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