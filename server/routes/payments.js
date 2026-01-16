const express = require('express');

const Payments = require('../../models/Payments');

const router = express.Router();

router.post('/payments', async (req, res) => {
  const {
    tariff, tariff_type, training_sessions,
    amount, start_date, end_date, client_id
  } = req.body;

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
