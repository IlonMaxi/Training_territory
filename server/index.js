require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

require('../models/associations');

const { startNutritionScheduler } = require('./services/nutritionScheduler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://26.100.29.243:3000'
}));

app.use(bodyParser.json());

startNutritionScheduler();

app.use(require('./routes/admin'));
app.use(require('./routes/auth'));
app.use(require('./routes/coaches'));
app.use(require('./routes/clients'));
app.use(require('./routes/exercises'));
app.use(require('./routes/nutrition'));
app.use(require('./routes/progress'));
app.use(require('./routes/schedule'));
app.use(require('./routes/workouts'));
app.use(require('./routes/measurements'));
app.use(require('./routes/payments'));
app.use(require('./routes/feedback'));
app.use(require('./routes/chat'));

module.exports = app;
