const express = require('express');

const WorkoutExercise = require('../../../models/WorkoutExercise');

const router = express.Router();

// Состав программ тренировок: какие упражнения, в каком порядке,
// сколько подходов и повторов. Именно это читает помощник в чате.
router.get('/admin/workout-exercises', async (req, res) => {
  try {
    const items = await WorkoutExercise.findAll({
      order: [['workout_id', 'ASC'], ['position', 'ASC']]
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/workout-exercises', async (req, res) => {
  try {
    const created = await WorkoutExercise.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/workout-exercises/:id', async (req, res) => {
  try {
    const item = await WorkoutExercise.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Запись не найдена' });

    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/workout-exercises/:id', async (req, res) => {
  try {
    const deleted = await WorkoutExercise.destroy({ where: { workoutexerciseid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Запись не найдена' });

    res.json({ message: 'Запись удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
