import express from 'express';
import * as orderController from '../controllers/order.js';

const router = express.Router();

// 透過時間獲取範圍內的訂單
router.get('/', orderController.getOrdersByTimeRange);

// 獲取特定店家在特定時間段的訂單
router.get('/order/:storeId', orderController.getStoreOrdersByTimeRange);

// 獲取今日特定店家的訂單
router.get('/today/:storeId', orderController.getTodayStoreOrders);

// 獲取訂單流水號
router.get('/number', orderController.getOrderNumber);

// 根據 ID 獲取單個訂單
router.get('/:id', orderController.getOrderById);

// 創建訂單
router.post('/', orderController.createOrder);

// 更新訂單
router.put('/:id', orderController.updateOrder);

// 刪除訂單
// router.delete('/:id', orderController.deleteOrder);

export default router;