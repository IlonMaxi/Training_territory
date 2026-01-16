const express = require('express');

const Exercise = require('../../../models/Exercise');

const router = express.Router();

router.get('/admin/exercises', async (req, res) => {
  try {
    const exercises = await Exercise.findAll();
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/exercises', async (req, res) => {
  try {
    const created = await Exercise.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/exercises/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) return res.status(404).json({ error: 'Упражнение не найдено' });

    await exercise.update(req.body);
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/exercises/:id', async (req, res) => {
  try {
    const deleted = await Exercise.destroy({ where: { exerciseid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Упражнение не найдено' });

    res.json({ message: 'Упражнение удалено' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
