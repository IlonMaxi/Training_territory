require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

require('../models/associations');

const { startNutritionScheduler } = require('./services/nutritionScheduler');
const { requireAuth, requireAdmin } = require('./middlewares/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://26.100.29.243:3000',
  credentials: true
}));

app.use(express.json());

// SESSION_SECRET обязателен в проде; в dev генерируем разовый —
// сессии тогда сбрасываются при каждом перезапуске сервера.
const sessionSecret = process.env.SESSION_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET не задан в .env');
  }
  console.warn('SESSION_SECRET не задан — использую временный ключ (сессии не переживут перезапуск)');
  return crypto.randomBytes(32).toString('hex');
})();

app.use(session({
  name: 'tt.sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff')
}));

startNutritionScheduler();

// Гварды уровня префикса: всё, что ниже, уже проверено на вход/права
app.use('/admin', requireAdmin);
app.use('/chat', requireAuth);
app.use('/ml', requireAuth);
app.use('/send-feedback', requireAuth);
app.use('/exercises', requireAuth);
app.use('/workouts', requireAuth);
app.use('/progress', requireAuth);
app.use('/unit-measurements', requireAuth);
app.use('/nutrition', requireAuth);
app.use('/payments', requireAuth);

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
app.use(require('./routes/ml'));

module.exports = app;
