const express = require('express');

const Payments = require('../../../models/Payments');

const router = express.Router();

router.get('/admin/payments', async (req, res) => {
  try {
    const payments = await Payments.findAll();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/payments', async (req, res) => {
  try {
    const payment = await Payments.create(req.body);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/payments/:id', async (req, res) => {
  try {
    const deleted = await Payments.destroy({ where: { paymentid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Оплата не найдена' });

    res.json({ message: 'Оплата удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/payments/:id', async (req, res) => {
  try {
    const payment = await Payments.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Оплата не найдена' });

    await payment.update(req.body);
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
