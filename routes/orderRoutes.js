import express from 'express';
import Order from '../schemas/orderSchema.js';

const router = express.Router();

// 透過時間取得範圍內的 order
router.get('/', async (req, res) => {
  try {
    const { start, end } = req.query;
    const orders = await Order.find({
      createdAt: {
        $gte: start,
        $lt: end,
      },
    });
    if (!orders) return res.status(404).json({ error: 'Order not found' });

    res.json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).send('Internal server error');
  }
});

// 取的流水號
router.get('/number', async (req, res) => {
  try {
    const eightHoursInMilliseconds = 8 * 60 * 60 * 1000;

    // 1. 取得目前 UTC 時間
    const nowUTC = new Date();

    // 2. 轉換為 UTC+8 時間
    const nowUTC8 = new Date(nowUTC.getTime() + eightHoursInMilliseconds);

    // 3. 獲取 UTC+8 的今天 00:00:00
    const startUTC8 = new Date(nowUTC8);
    startUTC8.setHours(0, 0, 0, 0);

    // 4. 獲取 UTC+8 的明天 00:00:00
    const endUTC8 = new Date(startUTC8);
    endUTC8.setDate(endUTC8.getDate() + 1);

    // 5. 轉換回 UTC+0（減去 8 小時）
    const startUTC = new Date(startUTC8.getTime() - eightHoursInMilliseconds);
    const endUTC = new Date(endUTC8.getTime() - eightHoursInMilliseconds);

    // 查詢今天範圍內最新的一筆訂單
    const lastOrder = await Order.findOne({
      createdAt: { $gte: startUTC, $lt: endUTC },
    }).sort({ _id: -1 });

    if (!lastOrder) return res.json({ number: 1 });

    res.json({ number: Number(lastOrder.orderNumber) + 1 });
  } catch (error) {
    console.error('Error getting order number:', error);
    res.status(500).send('Internal server error');
  }
});


// 取得單個 order
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('store') // 取出店家資訊
      .populate({
        path: 'items.itemId',
      })
      .populate('items.options.addons') // 展開加料 Addon
      .populate('items.options.additionalMeats'); // 展開額外加肉

    if (!order) return res.status(404).json({ error: 'Order not found' });
    // console.log(order)
    res.json(order);
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).send('Internal server error');
  }
});


// 創建 order
router.post('/', async (req, res) => {
  try {
    // console.log(req.body);
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.json({ id: savedOrder._id });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).send('Internal server error');
  }
});

// 更新 order
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndUpdate(id, req.body);

    res.send('Order updated successfully');
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).send('Internal server error');
  }
});

// 刪除 order
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndDelete(id);

    res.send('Order deleted successfully');
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).send('Internal server error');
  }
});

// const deleteAll = async () => {
//   try {
//     await Order.deleteMany({});
//     console.log('delete all completed')
//   } catch (error) {
//     console.error('Error deleting all orders:', error);
//   }
// }

// deleteAll()




export default router;