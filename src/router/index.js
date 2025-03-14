import { createRouter, createWebHistory } from 'vue-router'

// 引入頁面
import LoginView from '../views/LoginView.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import StaffOrder from '../views/staff/StaffOrder.vue'
import CustomerMenu from '../views/customer/CustomerMenu.vue'
import NotFound from '../views/NotFound.vue'
import axios from 'axios';
import DishAdd from '../views/admin/DishAdd.vue'
import DishShow from '../views/admin/DishShow.vue'
import MenuAdd from '../views/admin/MenuAdd.vue'
import MenuShow from '../views/admin/MenuShow.vue'
import AdminIndex from '../views/admin/Index.vue'
import DishEdit from '../views/admin/DishEdit.vue'
import MenuEdit from '../views/admin/MenuEdit.vue'
import StoreAdd from '@/views/admin/StoreAdd.vue'
import StoreShow from '@/views/admin/StoreShow.vue'
import StoreEdit from '@/views/admin/StoreEdit.vue'
import Confirmation from '@/views/customer/Confirmation.vue'
import test from '@/views/staff/stafftest.vue'


const isLoggedIn = async () => {
  try {
    const response = await axios.get(`/authentication/current_user`);
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
          component: () => import('../views/admin/OrdersList.vue'),
        },
        {
          path: 'orders/:date',
          name: 'admin-orders-detail',
          component: () => import('../views/admin/OrdersDetail.vue'),
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
      path: '/test',
      name: 'test',
      component: test

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
        path: '/login',
        query: { redirect: to.fullPath }
      });
    }
  }
  next();
});

export default router
