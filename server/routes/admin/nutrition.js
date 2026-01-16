const express = require('express');

const Nutrition = require('../../../models/Nutrition');

const router = express.Router();

router.get('/admin/nutrition', async (req, res) => {
  try {
    const nutrition = await Nutrition.findAll();
    res.json(nutrition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/nutrition', async (req, res) => {
  try {
    const newRecord = await Nutrition.create(req.body);
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/nutrition/:id', async (req, res) => {
  try {
    const record = await Nutrition.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: 'Запись не найдена' });

    await record.update(req.body);
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/nutrition/:id', async (req, res) => {
  try {
    const deleted = await Nutrition.destroy({ where: { foodid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Запись не найдена' });

    res.json({ message: 'Запись удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
