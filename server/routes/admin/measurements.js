const express = require('express');

const KgMeasurement = require('../../../models/KgMeasurement');
const SmMeasurement = require('../../../models/SmMeasurement');
const PercentageMeasurement = require('../../../models/PercentageMeasurement');
const UnitMeasurement = require('../../../models/UnitMeasurement');

const router = express.Router();

router.get('/admin/kg-measurements', async (req, res) => {
  try {
    const measurements = await KgMeasurement.findAll();
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/kg-measurements', async (req, res) => {
  try {
    const newMeasurement = await KgMeasurement.create(req.body);
    res.status(201).json(newMeasurement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/kg-measurements/:id', async (req, res) => {
  try {
    const measurement = await KgMeasurement.findByPk(req.params.id);
    if (!measurement) return res.status(404).json({ error: 'Измерение не найдено' });

    await measurement.update(req.body);
    res.json(measurement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/kg-measurements/:id', async (req, res) => {
  try {
    const deleted = await KgMeasurement.destroy({ where: { kilogramid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Измерение не найдено' });

    res.json({ message: 'Измерение удалено' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/cm-measurements', async (req, res) => {
  try {
    const measurements = await SmMeasurement.findAll();
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/cm-measurements', async (req, res) => {
  try {
    const newMeasurement = await SmMeasurement.create(req.body);
    res.status(201).json(newMeasurement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/cm-measurements/:id', async (req, res) => {
  try {
    const measurement = await SmMeasurement.findByPk(req.params.id);
    if (!measurement) return res.status(404).json({ error: 'Измерение не найдено' });

    await measurement.update(req.body);
    res.json(measurement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/cm-measurements/:id', async (req, res) => {
  try {
    const deleted = await SmMeasurement.destroy({ where: { centimetreid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Измерение не найдено' });

    res.json({ message: 'Измерение удалено' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/percentage-measurements', async (req, res) => {
  try {
    const measurements = await PercentageMeasurement.findAll();
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/percentage-measurements', async (req, res) => {
  try {
    const newMeasurement = await PercentageMeasurement.create(req.body);
    res.status(201).json(newMeasurement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/percentage-measurements/:id', async (req, res) => {
  try {
    const measurement = await PercentageMeasurement.findByPk(req.params.id);
    if (!measurement) return res.status(404).json({ error: 'Измерение не найдено' });

    await measurement.update(req.body);
    res.json(measurement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/percentage-measurements/:id', async (req, res) => {
  try {
    const deleted = await PercentageMeasurement.destroy({ where: { percentageid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Измерение не найдено' });

    res.json({ message: 'Измерение удалено' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/unit-measurements', async (req, res) => {
  try {
    const measurements = await UnitMeasurement.findAll();
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/unit-measurements', async (req, res) => {
  try {
    const newMeasurement = await UnitMeasurement.create(req.body);
    res.status(201).json(newMeasurement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/unit-measurements/:id', async (req, res) => {
  try {
    const measurement = await UnitMeasurement.findByPk(req.params.id);
    if (!measurement) return res.status(404).json({ error: 'Измерение не найдено' });

    await measurement.update(req.body);
    res.json(measurement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/unit-measurements/:id', async (req, res) => {
  try {
    const deleted = await UnitMeasurement.destroy({ where: { measurementid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Измерение не найдено' });

    res.json({ message: 'Измерение удалено' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
