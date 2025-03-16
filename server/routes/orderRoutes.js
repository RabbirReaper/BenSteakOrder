import express from 'express';
import Order from '../schemas/orderSchema.js';

const router = express.Router();

const getTodayRange = () => {
  // Constants
  const HOURS_OFFSET = 8; // UTC+8
  const MS_PER_HOUR = 60 * 60 * 1000;

  // Get current time in UTC+8
  const nowUTC = new Date();
  const nowUTC8 = new Date(nowUTC.getTime() + HOURS_OFFSET * MS_PER_HOUR);

  // Extract date components from UTC+8 time
  const year8 = nowUTC8.getUTCFullYear();
  const month8 = nowUTC8.getUTCMonth();
  const day8 = nowUTC8.getUTCDate();

  // Create the start time (00:00:00 UTC+8, expressed in UTC)
  const startUTC = new Date(Date.UTC(year8, month8, day8, 0, 0, 0, 0));
  startUTC.setUTCHours(startUTC.getUTCHours() - HOURS_OFFSET);

  // Create the end time (00:00:00 next day UTC+8, expressed in UTC)
  const endUTC = new Date(startUTC.getTime() + 24 * MS_PER_HOUR);

  return { startUTC, endUTC };
};

// // 透過時間取得範圍內的 order
// router.get('/', async (req, res) => {
//   try {
//     const { start, end } = req.query;
//     const orders = await Order.find({
//       createdAt: {
//         $gte: start,
//         $lt: end,
//       },
//     });
//     if (!orders) return res.status(404).json({ error: 'Order not found' });

//     res.json(orders);
//   } catch (error) {
//     console.error('Error getting orders:', error);
//     res.status(500).send('Internal server error');
//   }
// });

// 透過時間取得範圍內的 order
router.get('/', async (req, res) => {
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

    if (!orders) return res.status(404).json({ error: 'Order not found' });
    // console.log(JSON.stringify(orders[0], null, 2)); // 查看第一筆訂單的完整結構
    res.json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).send('Internal server error');
  }
});

router.get('/order/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    let { start, end } = req.query;

    // 明確處理時區差異
    // 如果前端發送的是 UTC+8 格式，而資料庫儲存的是 UTC+0
    start = new Date(start);
    end = new Date(end);

    // 不需要額外調整，因為 MongoDB 會自動處理 UTC 轉換
    // 如果確實需要調整，可以這樣做：
    // const utcOffset = 8 * 60 * 60 * 1000; // 8小時的毫秒數
    // start = new Date(start.getTime() - utcOffset);
    // end = new Date(end.getTime() - utcOffset);

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

    res.json(orders);
  } catch (error) {
    console.error('Error getting orders for store:', error);
    res.status(500).send('Internal server error');
  }
});

router.get('/today/:storeId', async (req, res) => {
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

    res.json(orders);

  } catch (err) {
    console.error('Error getting orders for store:', err);
    res.status(500).send('Internal server error');
  }
})

// 取的流水號
router.get('/number', async (req, res) => {
  try {
    const { startUTC, endUTC } = getTodayRange();

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