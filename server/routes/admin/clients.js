const express = require('express');
const bcrypt = require('bcrypt');

const Clients = require('../../../models/Client');

const router = express.Router();

router.get('/admin/clients', async (req, res) => {
  try {
    const clients = await Clients.findAll();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/clients', async (req, res) => {
  try {
    const {
      last_name,
      first_name,
      patronymic,
      username,
      password,
      phone_number,
      email,
      birth_date,
      gender,
      image
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newClient = await Clients.create({
      last_name,
      first_name,
      patronymic,
      username,
      password: hashedPassword,
      phone_number,
      email,
      birth_date,
      gender,
      image
    });

    res.status(201).json(newClient);
  } catch (err) {
    console.error('Admin client creation error:', err);
    res.status(500).json({ error: 'Ошибка сервера при создании клиента' });
  }
});

router.put('/admin/clients/:id', async (req, res) => {
  try {
    const client = await Clients.findByPk(req.params.id);
    if (!client) return res.status(404).json({ error: 'Клиент не найден' });
    await client.update(req.body);
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/clients/:id', async (req, res) => {
  try {
    const deleted = await Clients.destroy({ where: { clientid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Клиент не найден' });
    res.json({ message: 'Клиент удалён' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
