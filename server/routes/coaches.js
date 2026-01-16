const express = require('express');
const bcrypt = require('bcrypt');

const Coaches = require('../../models/Coach');
const Clients = require('../../models/Client');
const Workout = require('../../models/Workout');

const { upload } = require('../middlewares/upload');
const { assignTraining } = require('../services/trainingService');

const router = express.Router();

router.post('/coaches', async (req, res) => {
  const { last_name, first_name, patronymic, username, password, phone_number, email, birth_date, gender } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newCoach = await Coaches.create({
      last_name,
      first_name,
      patronymic,
      username,
      password: hashedPassword,
      phone_number,
      email,
      birth_date,
      gender
    });

    res.status(201).json(newCoach);
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/coaches/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    patronymic,
    username,
    phone_number,
    email,
    specialization,
    experience,
    gender
  } = req.body;

  try {
    const coach = await Coaches.findByPk(id);
    if (!coach) {
      return res.status(404).json({ error: 'Тренер не найден' });
    }

    await coach.update({
      first_name,
      last_name,
      patronymic,
      username,
      phone_number,
      email,
      specialization,
      experience,
      gender,
      image: req.file ? req.file.filename : coach.image
    });

    res.status(200).json({ message: 'Данные тренера обновлены', user: coach });
  } catch (error) {
    console.error('Ошибка обновления тренера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/coaches/:coachId/workouts', async (req, res) => {
  const { coachId } = req.params;

  try {
    const coach = await Coaches.findByPk(coachId);
    if (!coach) {
      return res.status(404).json({ error: 'Тренер не найден' });
    }

    const workouts = await Workout.findAll({
      where: { coach_id: coachId },
      attributes: ['workoutid', 'name', 'description', 'difficulty', 'duration', 'workout_type', 'max_participants']
    });

    res.json(workouts);
  } catch (error) {
    console.error('Ошибка при получении тренировок:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

router.get('/coaches', async (req, res) => {
  const coaches = await Coaches.findAll();
  res.json(coaches);
});

router.get('/coaches/:coachId/clients', async (req, res) => {
  const { coachId } = req.params;

  try {
    const coach = await Coaches.findByPk(coachId);
    if (!coach) {
      return res.status(404).json({ error: 'Тренер не найден' });
    }

    const clients = await Clients.findAll({
      where: { coach_id: coachId },
      attributes: ['clientid', 'first_name', 'last_name', 'email', 'phone_number', 'birth_date', 'gender', 'image']
    });

    res.json(clients);
  } catch (error) {
    console.error('Ошибка при получении клиентов тренера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/coaches/:coachId/assign-training', async (req, res) => {
  const { coachId } = req.params;
  const { client_id, workout_id, date, start_time, end_time, location } = req.body;

  console.log('Назначение тренировки, тренер ID:', coachId);
  console.log('Данные тренировки:', req.body);

  if (!client_id || !workout_id || !date || !start_time || !end_time || !location) {
    return res.status(400).json({ error: 'Все поля обязательны для заполнения.' });
  }

  try {
    const newSchedule = await assignTraining(coachId, {
      client_id,
      workout_id,
      date,
      start_time,
      end_time,
      location
    });

    res.status(201).json({
      message: 'Тренировка успешно назначена.',
      schedule: newSchedule
    });
  } catch (error) {
    console.error('Ошибка при назначении тренировки:', error);
    const status = error.status || 500;
    const message = error.status ? error.message : 'Внутренняя ошибка сервера.';
    res.status(status).json({ error: message });
  }
});

module.exports = router;
