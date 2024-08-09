// server/index.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Coach = require('../models/Coach');
const Client = require('../models/Client');
const Exercise = require('../models/Exercise');
const Nutrition = require('../models/Nutrition');

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

// Экспортируйте приложение Express как middleware
module.exports = app;
