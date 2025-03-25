import Menu from '../models/Menus/Menu.js';

// 獲取所有菜單
export const getAllMenus = async (req, res) => {
  try {
    const menus = await Menu.find({});
    if (!menus) return res.status(404).json({ success: false, message: 'Menu not found' });

    res.json({
      success: true,
      menus
    });
  } catch (error) {
    console.error('Error getting menu:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 獲取單個菜單
export const getMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findById(id);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });

    res.json({
      success: true,
      menu
    });
  } catch (error) {
    console.error('Error getting menu:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 創建菜單
export const createMenu = async (req, res) => {
  try {
    const newMenu = new Menu(req.body);
    await newMenu.save();

    res.json({
      success: true,
      message: 'Menu created successfully',
      menu: newMenu
    });
  } catch (error) {
    console.error('Error creating menu:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 更新菜單
export const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMenu = await Menu.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updatedMenu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }

    res.json({
      success: true,
      message: 'Menu updated successfully',
      menu: updatedMenu
    });
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 刪除菜單
export const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMenu = await Menu.findByIdAndDelete(id);
    
    if (!deletedMenu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }

    res.json({
      success: true,
      message: 'Menu deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};