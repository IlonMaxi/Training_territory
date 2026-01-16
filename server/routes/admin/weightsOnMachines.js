const express = require('express');

const WeightsOnMachine = require('../../../models/WeightsOnMachine');

const router = express.Router();

router.get('/admin/weights-on-machines', async (req, res) => {
  try {
    const weights = await WeightsOnMachine.findAll();
    res.json(weights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/weights-on-machines', async (req, res) => {
  try {
    const { machine_weight, date } = req.body;
    const newWeight = await WeightsOnMachine.create({ machine_weight, date });
    res.status(201).json(newWeight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/weights-on-machines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { machine_weight, date } = req.body;

    const weight = await WeightsOnMachine.findByPk(id);
    if (!weight) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    await weight.update({ machine_weight, date });
    res.json(weight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/weights-on-machines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await WeightsOnMachine.destroy({ where: { weightid: id } });

    if (!deleted) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    res.json({ message: 'Запись удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
