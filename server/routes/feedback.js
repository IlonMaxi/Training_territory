const express = require('express');

const { sendFeedbackEmail } = require('../services/emailService');

const router = express.Router();

router.post('/send-feedback', async (req, res) => {
  const { rating, comment, clientEmail, clientName } = req.body;

  try {
    await sendFeedbackEmail({ rating, comment, clientEmail, clientName });

    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка при отправке письма:', err);
    res.status(500).json({ error: 'Ошибка сервера при отправке письма' });
  }
});

module.exports = router;
