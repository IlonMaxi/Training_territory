const express = require('express');

const Payments = require('../../models/Payments');

const { currentUser, isAdmin } = require('../middlewares/auth');

const router = express.Router();

router.post('/payments', async (req, res) => {
  const {
    tariff, tariff_type, training_sessions,
    amount, start_date, end_date
  } = req.body;

  // client_id берём из сессии, а не из тела запроса:
  // иначе любой мог оформить подписку на чужой аккаунт
  const user = currentUser(req);
  const client_id = isAdmin(user) && req.body.client_id ? req.body.client_id : user.id;

  if (!isAdmin(user) && user.role !== 'client') {
    return res.status(403).json({ error: 'Подписку оформляет только клиент' });
  }

  try {
    await Payments.create({
      client_id,
      payment_date: new Date(),
      tariff,
      tariff_type,
      training_sessions,
      used_training_sessions: 0,
      start_date,
      end_date,
      amount
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка создания подписки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
