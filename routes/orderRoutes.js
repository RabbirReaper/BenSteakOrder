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
    const start = new Date();
    const eightHoursInMilliseconds = 8 * 60 * 60 * 1000;
    start.setHours(0, 0, 0, 0); // 設定為今天的 00:00:00
    start.setTime(start.getTime() + eightHoursInMilliseconds); // 將時間轉換為 UTC+8
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
    end.setTime(end.getTime() + eightHoursInMilliseconds); // 將時間轉換為 UTC+8
    // console.log(start, end);
    const lastOrder = await Order.findOne({
      createdAt: { $gte: start, $lt: end },
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
    console.log(order)
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




export default router;