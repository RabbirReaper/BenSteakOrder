import express from 'express';
import Store from '../schemas/storeSchema.js';

const router = express.Router();

const checkAuth = (req, res, next) => {
  // if (!req.session.user_id) {
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }
  next();
};

// 取得 store
router.get('/', async (req, res) => {
  try {
    const store = await Store.find({});
    if (!store) return res.status(404).json({ error: 'Store not found' });

    res.json(store);
  } catch (error) {
    console.error('Error getting store:', error);
    res.status(500).send('Internal server error');
  }
});

// 取得單個 store
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findById(id).populate('menuItem');
    if (!store) return res.status(404).json({ error: 'Store not found' });

    res.json(store);
  } catch (error) {
    console.error('Error getting store:', error);
    res.status(500).send('Internal server error');
  }
});

// 創建 store
router.post('/', checkAuth, async (req, res) => {
  try {
    const newStore = new Store(req.body);
    await newStore.save();

    res.send('Store created successfully');
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).send('Internal server error');
  }
});

// 更新 store
router.put('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await Store.findByIdAndUpdate(id, req.body);

    res.send('Store updated successfully');
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).send('Internal server error');
  }
});

// 刪除 store
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await Store.findByIdAndDelete(id);

    res.send('Store deleted successfully');
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).send('Internal server error');
  }
});

export default router;