const express = require('express');

const Clients = require('../../../models/Client');
const Progress = require('../../../models/Progress');
const UnitMeasurement = require('../../../models/UnitMeasurement');
const PercentageMeasurement = require('../../../models/PercentageMeasurement');
const KgMeasurement = require('../../../models/KgMeasurement');
const SmMeasurement = require('../../../models/SmMeasurement');
const WeightsOnMachine = require('../../../models/WeightsOnMachine');

const router = express.Router();

router.get('/admin/progress', async (req, res) => {
  try {
    const records = await Progress.findAll({
      include: [
        { model: Clients, as: 'client' },
        { model: UnitMeasurement, as: 'unitMeasurement' },
        { model: PercentageMeasurement, as: 'percentageMeasurement' },
        { model: KgMeasurement, as: 'kilogramMeasurement' },
        { model: SmMeasurement, as: 'centimetreMeasurement' },
        { model: WeightsOnMachine, as: 'weight' }
      ]
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/progress', async (req, res) => {
  try {
    const progress = await Progress.create(req.body);
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/progress/:id', async (req, res) => {
  try {
    const progress = await Progress.findByPk(req.params.id);
    if (!progress) return res.status(404).json({ error: 'Прогресс не найден' });

    await progress.update(req.body);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/progress/:id', async (req, res) => {
  try {
    const deleted = await Progress.destroy({ where: { progressid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Прогресс не найден' });

    res.json({ message: 'Прогресс удалён' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
