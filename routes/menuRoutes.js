import express from 'express';
import Menu from '../schemas/menuSchema.js';

const router = express.Router();

// 取得 menu
router.get('/', async (req, res) => {
  try {
    const menu = await Menu.find({});
    if (!menu) return res.status(404).json({ error: 'Menu not found' });

    res.json(menu);
  } catch (error) {
    console.error('Error getting menu:', error);
    res.status(500).send('Internal server error');
  }
});

// 取得單個 menu

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findById(id);
    if (!menu) return res.status(404).json({ error: 'Menu not found' });

    res.json(menu);
  } catch (error) {
    console.error('Error getting menu:', error);
    res.status(500).send('Internal server error');
  }
});

// 創建 menu
router.post('/', async (req, res) => {
  try {
    const newMenu = new Menu(req.body);
    await newMenu.save();

    res.send('Menu created successfully');
  } catch (error) {
    console.error('Error creating menu:', error);
    res.status(500).send('Internal server error');
  }
});

// 更新 menu
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Menu.findByIdAndUpdate(id, req.body);

    res.send('Menu updated successfully');
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).send('Internal server error');
  }
});

// 刪除 menu
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Menu.findByIdAndDelete(id);

    res.send('Menu deleted successfully');
  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).send('Internal server error');
  }
});


export default router;