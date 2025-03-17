import { createRouter, createWebHistory } from 'vue-router'

// 引入頁面
import LoginView from '@/views/auth/loginView.vue'
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
    {
      path: '/login',
      name: 'login',
      component: LoginView, // 登入頁面
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminIndex,
      meta: { requiresAuth: false }, // 需要登入
      children: [
        // 餐點新增介面 - 新增、修改、刪除
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
          name: 'admin-dish-showbyid',
          component: DishEdit,
        },
        // 菜單新增介面
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
          name: 'admin-menu-Edit',
          component: MenuEdit,
        },
        // 店家新增介面
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
        // // 營收及訂單列表與統計
        // {
        //   path: 'sales',
        //   name: 'admin-sales',
        //   component: SalesOrdersStats,
        // },
        // // 訂單列表
        // {
        //   path: 'sales/list',
        //   name: 'admin-order-list',
        //   component: OrderList,
        // },
      ],
    },
    {
      path: '/staff/:storeId',
      name: 'staff',
      component: StaffOrder,
      meta: { requiresAuth: false }, // 需要登入
    },
    {
      path: '/customer/:store',
      name: 'customer',
      component: CustomerMenu,
    },
    {
      path: '/confirmation/:orderId',
      name: 'confirmation',
      component: Confirmation,
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
        path: '/auth/login',
        query: { redirect: to.fullPath }
      });
    }
  }
  next();
});

export default router
