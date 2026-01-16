const express = require('express');

const Coaches = require('../../../models/Coach');
const Clients = require('../../../models/Client');
const Schedule = require('../../../models/Schedule');
const ClientSchedule = require('../../../models/ClientSchedule');
const Workout = require('../../../models/Workout');

const router = express.Router();

router.get('/admin/schedule', async (req, res) => {
  try {
    const schedules = await Schedule.findAll({
      include: [
        { model: Coaches, as: 'coach' },
        { model: Workout, as: 'workout' }
      ]
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/schedule', async (req, res) => {
  try {
    const schedule = await Schedule.create(req.body);
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/schedule/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Расписание не найдено' });

    await schedule.update(req.body);
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/schedule/:id', async (req, res) => {
  try {
    const deleted = await Schedule.destroy({ where: { scheduleid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Расписание не найдено' });

    res.json({ message: 'Расписание удалено' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/client-schedule', async (req, res) => {
  try {
    const records = await ClientSchedule.findAll({
      include: [
        {
          model: Clients,
          as: 'client'
        },
        {
          model: Schedule,
          as: 'schedule',
          include: [
            { model: Coaches, as: 'coach' },
            { model: Workout, as: 'workout' }
          ]
        }
      ]
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/client-schedule', async (req, res) => {
  try {
    const record = await ClientSchedule.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/client-schedule/:id', async (req, res) => {
  try {
    const record = await ClientSchedule.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: 'Запись не найдена' });

    await record.update(req.body);
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/client-schedule/:id', async (req, res) => {
  try {
    const deleted = await ClientSchedule.destroy({ where: { clientscheduleid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Запись не найдена' });

    res.json({ message: 'Запись удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
