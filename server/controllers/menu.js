import Menu from '../models/Menus/Menu.js';

// 獲取所有菜單
export const getAllMenus = async (req, res) => {
  try {
    const menu = await Menu.find({});
    if (!menu) return res.status(404).json({ error: 'Menu not found' });

    res.json(menu);
  } catch (error) {
    console.error('Error getting menu:', error);
    res.status(500).send('Internal server error');
  }
};

// 獲取單個菜單
export const getMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findById(id);
    if (!menu) return res.status(404).json({ error: 'Menu not found' });

    res.json(menu);
  } catch (error) {
    console.error('Error getting menu:', error);
    res.status(500).send('Internal server error');
  }
};

// 創建菜單
export const createMenu = async (req, res) => {
  try {
    const newMenu = new Menu(req.body);
    await newMenu.save();

    res.send('Menu created successfully');
  } catch (error) {
    console.error('Error creating menu:', error);
    res.status(500).send('Internal server error');
  }
};

// 更新菜單
export const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    await Menu.findByIdAndUpdate(id, req.body);

    res.send('Menu updated successfully');
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).send('Internal server error');
  }
};

// 刪除菜單
export const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    await Menu.findByIdAndDelete(id);

    res.send('Menu deleted successfully');
  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).send('Internal server error');
  }
};