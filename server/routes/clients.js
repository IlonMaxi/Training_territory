const express = require('express');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

const Coaches = require('../../models/Coach');
const Clients = require('../../models/Client');
const Progress = require('../../models/Progress');
const UnitMeasurement = require('../../models/UnitMeasurement');
const KgMeasurement = require('../../models/KgMeasurement');
const SmMeasurement = require('../../models/SmMeasurement');
const PercentageMeasurement = require('../../models/PercentageMeasurement');
const Payments = require('../../models/Payments');

const { upload } = require('../middlewares/upload');
const { getProgressSummary } = require('../services/progressService');
const { addFullMeasurement } = require('../services/measurementService');

const router = express.Router();

router.post('/clients', async (req, res) => {
  const { last_name, first_name, patronymic, username, password, phone_number, email, birth_date, gender } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Clients.create({
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

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Registration error:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.put('/clients/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    patronymic,
    username,
    phone_number,
    email,
    gender
  } = req.body;

  try {
    const client = await Clients.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    await client.update({
      first_name,
      last_name,
      patronymic,
      username,
      phone_number,
      email,
      gender,
      image: req.file ? req.file.filename : client.image
    });

    res.status(200).json({ message: 'Данные клиента обновлены', user: client });
  } catch (error) {
    console.error('Ошибка обновления данных клиента:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/clients/:clientId/coach', async (req, res) => {
  const { clientId } = req.params;

  try {
    const client = await Clients.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    const coach = await Coaches.findByPk(client.coach_id);
    if (!coach) {
      return res.status(404).json({ error: 'Тренер не найден' });
    }

    res.json(coach);
  } catch (error) {
    console.error('Ошибка при получении тренера клиента:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/clients/:clientId/coach', async (req, res) => {
  const { coachId } = req.body;
  await Clients.update({ coach_id: coachId }, { where: { clientid: req.params.clientId } });
  res.json({ message: 'Тренер назначен' });
});

router.delete('/clients/:clientId/coach', async (req, res) => {
  const { clientId } = req.params;
  try {
    const client = await Clients.findByPk(clientId);
    if (!client) return res.status(404).json({ error: 'Клиент не найден' });

    client.coach_id = null;
    await client.save();

    res.json({ message: 'Тренер успешно убран' });
  } catch (error) {
    console.error('Ошибка при удалении тренера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/clients/:clientId', async (req, res) => {
  const { clientId } = req.params;

  try {
    const client = await Clients.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    const photoUrl = client.image || 'default.jpg';

    res.json({
      clientId: client.clientid,
      firstName: client.first_name,
      lastName: client.last_name,
      email: client.email,
      phoneNumber: client.phone_number,
      birthDate: client.birth_date,
      gender: client.gender,
      imageUrl: photoUrl
    });
  } catch (error) {
    console.error('Ошибка при получении данных клиента:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/clients/:clientId/progress-summary', async (req, res) => {
  const { clientId } = req.params;

  try {
    const summary = await getProgressSummary(clientId);
    if (!summary) {
      return res.status(404).json({ error: 'Недостаточно данных для вычисления прогресса.' });
    }

    res.json(summary);
  } catch (error) {
    console.error('Ошибка при вычислении прогресса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/clients/:id/unit-measurements-history', async (req, res) => {
  const { id: clientId } = req.params;

  try {
    const history = await Progress.findAll({
      where: { client_id: clientId },
      include: [{ model: UnitMeasurement, as: 'unitMeasurement' }],
      order: [['progressid', 'ASC']]
    });

    const result = history
      .filter(p => p.unitMeasurement)
      .map(p => ({
        date: p.unitMeasurement.date,
        bmi: parseFloat(p.unitMeasurement.bmi),
        metabolism: parseFloat(p.unitMeasurement.metabolism),
        body_age: parseFloat(p.unitMeasurement.body_age)
      }));

    res.json(result);
  } catch (error) {
    console.error('Ошибка при получении истории замеров в единицах:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/clients/:id/kg-measurements-history', async (req, res) => {
  const { id: clientId } = req.params;

  try {
    const history = await Progress.findAll({
      where: { client_id: clientId },
      include: [{ model: KgMeasurement, as: 'kilogramMeasurement' }],
      order: [['progressid', 'ASC']]
    });

    const result = history
      .filter(p => p.kilogramMeasurement)
      .map(p => ({
        date: p.kilogramMeasurement.date,
        weight: parseFloat(p.kilogramMeasurement.weight),
        fat_mass: parseFloat(p.kilogramMeasurement.fat_mass),
        skeletal_mass: parseFloat(p.kilogramMeasurement.skeletal_mass),
        muscle_mass: parseFloat(p.kilogramMeasurement.muscle_mass),
        water_content: parseFloat(p.kilogramMeasurement.water_content),
        bone_mass: parseFloat(p.kilogramMeasurement.bone_mass),
        lbm: parseFloat(p.kilogramMeasurement.lbm)
      }));

    res.json(result);
  } catch (error) {
    console.error('Ошибка при получении истории в килограммах:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/clients/:id/cm-measurements-history', async (req, res) => {
  const { id: clientId } = req.params;

  try {
    const history = await Progress.findAll({
      where: { client_id: clientId },
      include: [{ model: SmMeasurement, as: 'centimetreMeasurement' }],
      order: [['progressid', 'ASC']]
    });

    const result = history
      .filter(p => p.centimetreMeasurement)
      .map(p => {
        const cm = p.centimetreMeasurement;
        return {
          date: cm.date,
          chest_circumference: parseFloat(cm.chest_circumference),
          waist_circumference: parseFloat(cm.waist_circumference),
          hip_circumference: parseFloat(cm.hip_circumference),
          bicep_circumference: parseFloat(cm.bicep_circumference),
          forearm_circumference: parseFloat(cm.forearm_circumference),
          quadriceps_circumference: parseFloat(cm.quadriceps_circumference),
          calf_circumference: parseFloat(cm.calf_circumference),
          thigh_circumference: parseFloat(cm.thigh_circumference),
          neck_circumference: parseFloat(cm.neck_circumference),
          waist_inhale_circumference: parseFloat(cm.waist_inhale_circumference)
        };
      });

    res.json(result);
  } catch (error) {
    console.error('Ошибка при получении истории замеров в сантиметрах:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/clients/:id/percentage-measurements-history', async (req, res) => {
  const { id: clientId } = req.params;

  try {
    const history = await Progress.findAll({
      where: { client_id: clientId },
      include: [{ model: PercentageMeasurement, as: 'percentageMeasurement' }],
      order: [['progressid', 'ASC']]
    });

    const result = history
      .filter(p => p.percentageMeasurement)
      .map(p => {
        const perc = p.percentageMeasurement;
        return {
          date: perc.date,
          fat_percentage: parseFloat(perc.fat_percentage),
          skeletal_mass_percentage: parseFloat(perc.skeletal_mass_percentage),
          muscle_dynamics: parseFloat(perc.muscle_dynamics),
          body_water: parseFloat(perc.body_water),
          protein: parseFloat(perc.protein),
          fat_content: parseFloat(perc.fat_content)
        };
      });

    res.json(result);
  } catch (error) {
    console.error('Ошибка при получении истории процентных замеров:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/clients/:clientId/subscription', async (req, res) => {
  const { clientId } = req.params;

  try {
    const now = new Date();

    const activePayments = await Payments.findAll({
      where: {
        client_id: clientId,
        end_date: { [Op.gte]: now }
      },
      order: [['start_date', 'ASC']]
    });

    if (!activePayments.length) {
      return res.json(null);
    }

    const totalTraining = activePayments.reduce((acc, p) => acc + p.training_sessions, 0);
    const usedTraining = activePayments.reduce((acc, p) => acc + p.used_training_sessions, 0);

    res.json({
      tariff: activePayments[activePayments.length - 1].tariff,
      start_date: activePayments[0].start_date,
      end_date: activePayments[activePayments.length - 1].end_date,
      training_sessions: totalTraining,
      used_training_sessions: usedTraining,
      active: true
    });

  } catch (error) {
    console.error('Ошибка при получении подписки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/clients/:id/add-full-measurement', async (req, res) => {
  const { id: clientId } = req.params;

  try {
    const progress = await addFullMeasurement(clientId, req.body);
    res.status(201).json({ message: 'Все замеры и анализ успешно сохранены', progress_id: progress.progressid });
  } catch (error) {
    console.error('Ошибка при добавлении замеров и анализа:', error);
    res.status(500).json({ error: 'Ошибка сервера', detail: error.message });
  }
});

module.exports = router;
