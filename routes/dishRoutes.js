import express from 'express';
import MainDish from '../schemas/mainDishSchema.js';
import ElseDish from '../schemas/elseDishSchema.js';
import Addon from '../schemas/addonSchema.js';
import RawMeat from '../schemas/rawMeatSchema.js';


const router = express.Router();
const modelMap = {
  mainDish: MainDish,
  elseDish: ElseDish,
  addon: Addon,
  rawMeat: RawMeat
};

const checkAuth = (req, res, next) => {
  if (!req.session.user_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// 取得多個 dish
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const model = modelMap[type];

    if (!model) return res.status(400).json({ error: 'Invalid dish type' });

    const dish = await model.find({});
    if (!dish) return res.status(404).json({ error: 'Dish not found' });

    res.json(dish);
  } catch (error) {
    console.error('Error getting dish:', error);
    res.status(500).send('Internal server error');
  }
});

// 取得單個 dish
router.get('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const model = modelMap[type];

    if (!model) return res.status(400).json({ error: 'Invalid dish type' });

    const dish = await model.findById(id);
    if (!dish) return res.status(404).json({ error: 'Dish not found' });

    res.json(dish);
  } catch (error) {
    console.error('Error getting dish:', error);
    res.status(500).send('Internal server error');
  }
});


router.post('/:type', checkAuth,async (req, res) => {
  try {
    const { type } = req.params;
    const model = modelMap[type];

    if (!model) return res.status(400).json({ error: 'Invalid dish type' });

    const newDish = new model(req.body);
    await newDish.save();

    res.send('Dish created successfully');
  } catch (error) {
    console.error('Error creating dish:', error);
    res.status(500).send('Internal server error');
  }
});

// 更新 dish
router.put('/:type/:id', checkAuth,async (req, res) => {
  try {
    const { type, id } = req.params;
    const model = modelMap[type];

    if (!model) return res.status(400).json({ error: 'Invalid dish type' });

    const updatedDish = await model.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedDish) return res.status(404).json({ error: 'Dish not found' });

    res.send('Dish updated successfully');
  } catch (error) {
    console.error('Error updating dish:', error);
    res.status(500).send('Internal server error');
  }
});

// 刪除 dish
router.delete('/:type/:id', checkAuth,async (req, res) => {
  try {
    const { type, id } = req.params;
    const model = modelMap[type];

    if (!model) return res.status(400).json({ error: 'Invalid dish type' });

    const deletedDish = await model.findByIdAndDelete(id);
    if (!deletedDish) return res.status(404).json({ error: 'Dish not found' });

    res.send('Dish deleted successfully');
  } catch (error) {
    console.error('Error deleting dish:', error);
    res.status(500).send('Internal server error');
  }
});


export default router;