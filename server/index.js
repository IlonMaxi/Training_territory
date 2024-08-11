require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Coach = require('../models/Coach');
const Client = require('../models/Client');
const Exercise = require('../models/Exercise');
const Nutrition = require('../models/Nutrition');
const KgMeasurement = require('../models/KgMeasurement');
const SmMeasurement = require('../models/SmMeasurement');
const PercentageMeasurement = require('../models/PercentageMeasurement');
const Progress = require('../models/Progress');
const Schedule = require('../models/Schedule');
const UnitMeasurement = require('../models/UnitMeasurement');
const WeightsOnMachine = require('../models/WeightsOnMachine');
const Workout = require('../models/Workout');
const Payment = require('../models/Payment');

const app = express();
app.use(bodyParser.json());

// Маршруты для тренеров
app.get('/coaches', async (req, res) => {
  try {
    const coaches = await Coach.findAll();
    res.json(coaches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/coaches', async (req, res) => {
  try {
    const coach = await Coach.create(req.body);
    res.status(201).json(coach);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для клиентов
app.get('/clients', async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/clients', async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для упражнений
app.get('/exercises', async (req, res) => {
  try {
    const exercises = await Exercise.findAll();
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/exercises', async (req, res) => {
  try {
    const exercise = await Exercise.create(req.body);
    res.status(201).json(exercise);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для питания
app.get('/nutrition', async (req, res) => {
  try {
    const nutrition = await Nutrition.findAll();
    res.json(nutrition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/nutrition', async (req, res) => {
  try {
    const food = await Nutrition.create(req.body);
    res.status(201).json(food);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для замеров в килограммах
app.get('/kg-measurements', async (req, res) => {
  try {
    const measurements = await KgMeasurement.findAll();
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/kg-measurements', async (req, res) => {
  try {
    const measurement = await KgMeasurement.create(req.body);
    res.status(201).json(measurement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для замеров в сантиметрах
app.get('/sm-measurements', async (req, res) => {
  try {
    const measurements = await SmMeasurement.findAll();
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/sm-measurements', async (req, res) => {
  try {
    const measurement = await SmMeasurement.create(req.body);
    res.status(201).json(measurement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для процентных замеров
app.get('/percentage-measurements', async (req, res) => {
  try {
    const measurements = await PercentageMeasurement.findAll();
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/percentage-measurements', async (req, res) => {
  try {
    const measurement = await PercentageMeasurement.create(req.body);
    res.status(201).json(measurement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для прогресса
app.get('/progress', async (req, res) => {
  try {
    const progress = await Progress.findAll();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/progress', async (req, res) => {
  try {
    const progress = await Progress.create(req.body);
    res.status(201).json(progress);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для расписания
app.get('/schedule', async (req, res) => {
  try {
    const schedule = await Schedule.findAll();
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/schedule', async (req, res) => {
  try {
    const scheduleItem = await Schedule.create(req.body);
    res.status(201).json(scheduleItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для единичных замеров
app.get('/unit-measurements', async (req, res) => {
  try {
    const measurements = await UnitMeasurement.findAll();
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/unit-measurements', async (req, res) => {
  try {
    const measurement = await UnitMeasurement.create(req.body);
    res.status(201).json(measurement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для весов на тренажерах
app.get('/weights-on-machines', async (req, res) => {
  try {
    const weights = await WeightsOnMachine.findAll();
    res.json(weights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/weights-on-machines', async (req, res) => {
  try {
    const weight = await WeightsOnMachine.create(req.body);
    res.status(201).json(weight);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для тренировок
app.get('/workouts', async (req, res) => {
  try {
    const workouts = await Workout.findAll();
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/workouts', async (req, res) => {
  try {
    const workout = await Workout.create(req.body);
    res.status(201).json(workout);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для оплаты
app.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.findAll();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/payments', async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Экспортируйте приложение Express как middleware
module.exports = app;
