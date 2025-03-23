import PointSystem from '../models/Orders/PointSystem.js';

// 獲取所有點數系統設定
export const getAllPointSystems = async (req, res) => {
  try {
    const pointSystems = await PointSystem.find().sort({ active: -1, name: 1 });
    res.json(pointSystems);
  } catch (error) {
    console.error('Error getting point systems:', error);
    res.status(500).send('伺服器錯誤');
  }
};

// 獲取單個點數系統設定
export const getPointSystemById = async (req, res) => {
  try {
    const { id } = req.params;
    const pointSystem = await PointSystem.findById(id);
    
    if (!pointSystem) {
      return res.status(404).send('點數系統設定不存在');
    }
    
    res.json(pointSystem);
  } catch (error) {
    console.error('Error getting point system:', error);
    res.status(500).send('伺服器錯誤');
  }
};

// 新增點數系統設定
export const createPointSystem = async (req, res) => {
  try {
    const { name, minAmount, formula, description, active } = req.body;
    
    // 基本驗證
    if (!name || !formula || minAmount === undefined) {
      return res.status(400).send('名稱、公式和最低消費金額為必填欄位');
    }
    
    // 如果新的點數系統設定要設為啟用狀態，先把其他的設為停用
    if (active) {
      await PointSystem.updateMany({}, { active: false });
    }
    
    const newPointSystem = new PointSystem({
      name,
      minAmount,
      formula,
      description,
      active: active || false
    });
    
    await newPointSystem.save();
    res.status(201).json(newPointSystem);
  } catch (error) {
    console.error('Error creating point system:', error);
    res.status(500).send('伺服器錯誤');
  }
};

// 更新點數系統設定
export const updatePointSystem = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    // 只允許更新啟用狀態
    if (active === undefined) {
      return res.status(400).send('只允許更新啟用狀態');
    }
    
    // 如果要設為啟用狀態，先把其他的設為停用
    if (active) {
      await PointSystem.updateMany({}, { active: false });
    }
    
    const pointSystem = await PointSystem.findByIdAndUpdate(
      id,
      { active },
      { new: true }
    );
    
    if (!pointSystem) {
      return res.status(404).send('點數系統設定不存在');
    }
    
    res.json(pointSystem);
  } catch (error) {
    console.error('Error updating point system:', error);
    res.status(500).send('伺服器錯誤');
  }
};

// 刪除點數系統設定
export const deletePointSystem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pointSystem = await PointSystem.findById(id);
    if (!pointSystem) {
      return res.status(404).send('點數系統設定不存在');
    }
    
    // 禁止刪除已啟用的點數系統設定
    if (pointSystem.active) {
      return res.status(400).send('無法刪除已啟用的點數系統設定');
    }
    
    await PointSystem.findByIdAndDelete(id);
    res.send('點數系統設定已成功刪除');
  } catch (error) {
    console.error('Error deleting point system:', error);
    res.status(500).send('伺服器錯誤');
  }
};