const express = require('express');

const Workout = require('../../../models/Workout');

const router = express.Router();

router.get('/admin/workouts', async (req, res) => {
  try {
    const workouts = await Workout.findAll();
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/workouts', async (req, res) => {
  try {
    const created = await Workout.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/workouts/:id', async (req, res) => {
  try {
    const workout = await Workout.findByPk(req.params.id);
    if (!workout) return res.status(404).json({ error: 'Тренировка не найдена' });

    await workout.update(req.body);
    res.json(workout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/workouts/:id', async (req, res) => {
  try {
    const deleted = await Workout.destroy({ where: { workoutid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Тренировка не найдена' });

    res.json({ message: 'Тренировка удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
