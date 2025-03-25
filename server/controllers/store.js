import Store from '../models/Stores/Store.js';

// 獲取所有店家
export const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find({});
    if (!stores) return res.status(404).json({ success: false, message: 'Store not found' });

    res.json({
      success: true,
      stores
    });
  } catch (error) {
    console.error('Error getting store:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 獲取單個店家
export const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findById(id).populate('menuItem');
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

    res.json({
      success: true,
      store
    });
  } catch (error) {
    console.error('Error getting store:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 創建店家
export const createStore = async (req, res) => {
  try {
    const newStore = new Store(req.body);
    await newStore.save();

    res.json({
      success: true,
      message: 'Store created successfully',
      store: newStore
    });
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 更新店家
export const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStore = await Store.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updatedStore) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    res.json({
      success: true,
      message: 'Store updated successfully',
      store: updatedStore
    });
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 刪除店家
export const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStore = await Store.findByIdAndDelete(id);
    
    if (!deletedStore) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    res.json({
      success: true,
      message: 'Store deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};