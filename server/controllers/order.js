import Order from '../models/Orders/Order.js';
import { getTodayRange } from '../middlewares/dateUtils.js';
import mongoose from 'mongoose';

// 透過時間範圍獲取訂單
export const getOrdersByTimeRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    const filter = {};

    if (start && end) {
      filter.createdAt = {
        $gte: new Date(start),
        $lt: new Date(end),
      };
    }

    const orders = await Order.find(filter)
      .populate('store')
      .populate({
        path: 'items.dishInstance',
        populate: { 
          path: 'templateId',
          model: 'DishTemplate' 
        }
      })
      .populate('appliedCoupons');

    if (!orders) return res.status(404).json({ success: false, message: 'Order not found' });
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 獲取特定店家在特定時間段的訂單
export const getStoreOrdersByTimeRange = async (req, res) => {
  try {
    const { storeId } = req.params;
    let { start, end } = req.query;

    // 明確處理時區差異
    // 如果前端發送的是 UTC+8 格式，而資料庫儲存的是 UTC+0
    start = new Date(start);
    end = new Date(end);

    const orders = await Order.find({
      store: storeId,
      createdAt: {
        $gte: start,
        $lt: end,
      },
    })
      .populate({
        path: 'items.dishInstance',
        populate: { 
          path: 'templateId',
          model: 'DishTemplate' 
        }
      })
      .populate('appliedCoupons');

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error getting orders for store:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 獲取今日特定店家的訂單
export const getTodayStoreOrders = async (req, res) => {
  const { startUTC, endUTC } = getTodayRange();

  try {
    const { storeId } = req.params;

    const orders = await Order.find({
      store: storeId,
      createdAt: { $gte: startUTC, $lt: endUTC },
    })
      .populate({
        path: 'items.dishInstance',
        populate: { 
          path: 'templateId',
          model: 'DishTemplate' 
        }
      })
      .populate('appliedCoupons');

    res.json({
      success: true,
      orders
    });
  } catch (err) {
    console.error('Error getting orders for store:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 獲取訂單流水號
export const getOrderNumber = async (req, res) => {
  try {
    const { startUTC, endUTC } = getTodayRange();

    // 查詢今天範圍內最新的一筆訂單
    const lastOrder = await Order.findOne({
      createdAt: { $gte: startUTC, $lt: endUTC },
    }).sort({ _id: -1 });

    if (!lastOrder) return res.json({ success: true, number: 1 });

    res.json({ 
      success: true, 
      number: Number(lastOrder.orderNumber) + 1 
    });
  } catch (error) {
    console.error('Error getting order number:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 根據 ID 獲取單個訂單
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('store') // 取出店家資訊
      .populate({
        path: 'items.dishInstance',
        populate: { 
          path: 'templateId',
          model: 'DishTemplate' 
        }
      })
      .populate({
        path: 'appliedCoupons',
        populate: {
          path: 'templateId',
          model: 'CouponTemplate'
        }
      })
      .populate('owner'); // 也連結顧客資料

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 創建訂單
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderData = req.body;
    
    // 創建新訂單
    const newOrder = new Order(orderData);
    
    // 計算總金額
    newOrder.calculateTotal();
    
    const savedOrder = await newOrder.save({ session });
    
    // 如果需要，標記相關優惠券為已使用
    if (orderData.appliedCoupons && orderData.appliedCoupons.length > 0) {
      const CouponInstance = mongoose.model('CouponInstance');
      await CouponInstance.updateMany(
        { _id: { $in: orderData.appliedCoupons } },
        { 
          isUsed: true, 
          usedAt: new Date(),
          usedOrder: savedOrder._id
        },
        { session }
      );
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({ 
      success: true, 
      id: savedOrder._id,
      order: savedOrder
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 更新訂單
export const updateOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // 獲取舊訂單
    const oldOrder = await Order.findById(id).session(session);
    if (!oldOrder) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // 更新訂單
    const updatedOrder = await Order.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, session }
    );
    
    // 重新計算總金額
    updatedOrder.calculateTotal();
    await updatedOrder.save({ session });
    
    // 處理優惠券更新
    if (updateData.appliedCoupons) {
      const CouponInstance = mongoose.model('CouponInstance');
      
      // 先將舊優惠券重設為未使用
      if (oldOrder.appliedCoupons && oldOrder.appliedCoupons.length > 0) {
        await CouponInstance.updateMany(
          { _id: { $in: oldOrder.appliedCoupons } },
          { 
            isUsed: false, 
            usedAt: null,
            usedOrder: null
          },
          { session }
        );
      }
      
      // 標記新優惠券為已使用
      if (updateData.appliedCoupons.length > 0) {
        await CouponInstance.updateMany(
          { _id: { $in: updateData.appliedCoupons } },
          { 
            isUsed: true, 
            usedAt: new Date(),
            usedOrder: updatedOrder._id
          },
          { session }
        );
      }
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 更新訂單狀態
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentMethod } = req.body;
    
    // 基本驗證
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    
    // 準備更新資料
    const updateData = { orderStatus: status };
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }
    
    // 更新訂單
    const updatedOrder = await Order.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 刪除訂單
export const deleteOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    
    // 查找訂單
    const order = await Order.findById(id).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // 解除優惠券使用狀態
    if (order.appliedCoupons && order.appliedCoupons.length > 0) {
      const CouponInstance = mongoose.model('CouponInstance');
      
      await CouponInstance.updateMany(
        { _id: { $in: order.appliedCoupons } },
        { 
          isUsed: false, 
          usedAt: null,
          usedOrder: null
        },
        { session }
      );
    }
    
    // 刪除訂單
    await Order.findByIdAndDelete(id).session(session);
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error deleting order:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};