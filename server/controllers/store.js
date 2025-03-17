import Store from '../models/Stores/Store.js';

// 獲取所有店家
export const getAllStores = async (req, res) => {
  try {
    const store = await Store.find({});
    if (!store) return res.status(404).json({ error: 'Store not found' });

    res.json(store);
  } catch (error) {
    console.error('Error getting store:', error);
    res.status(500).send('Internal server error');
  }
};

// 獲取單個店家
export const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findById(id).populate('menuItem');
    if (!store) return res.status(404).json({ error: 'Store not found' });

    res.json(store);
  } catch (error) {
    console.error('Error getting store:', error);
    res.status(500).send('Internal server error');
  }
};

// 創建店家
export const createStore = async (req, res) => {
  try {
    const newStore = new Store(req.body);
    await newStore.save();

    res.send('Store created successfully');
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).send('Internal server error');
  }
};

// 更新店家
export const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    await Store.findByIdAndUpdate(id, req.body);

    res.send('Store updated successfully');
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).send('Internal server error');
  }
};

// 刪除店家
export const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    await Store.findByIdAndDelete(id);

    res.send('Store deleted successfully');
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).send('Internal server error');
  }
};