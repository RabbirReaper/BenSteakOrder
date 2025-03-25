import Order from '../models/Orders/Order.js';
import { getTodayRange } from '../middlewares/dateUtils.js';

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
        path: 'items',
        populate: { path: "itemId" },
      })
      .populate('items.options.addons')
      .populate('items.options.additionalMeats');

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
        path: 'items.itemId',
      })
      .populate('items.options.addons') // 展開加料 Addon
      .populate('items.options.additionalMeats'); // 展開額外加肉

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
        path: 'items.itemId',
      })
      .populate('items.options.addons') // 展開加料 Addon
      .populate('items.options.additionalMeats'); // 展開額外加肉

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
        path: 'items.itemId',
      })
      .populate('items.options.addons') // 展開加料 Addon
      .populate('items.options.additionalMeats'); // 展開額外加肉

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
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.json({ 
      success: true, 
      id: savedOrder._id,
      order: savedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 更新訂單
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 刪除訂單
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);
    
    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};