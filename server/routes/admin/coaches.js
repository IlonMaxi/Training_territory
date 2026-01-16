const express = require('express');
const bcrypt = require('bcrypt');

const Coaches = require('../../../models/Coach');

const router = express.Router();

router.get('/admin/coaches', async (req, res) => {
  try {
    const coaches = await Coaches.findAll();
    res.json(coaches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/coaches', async (req, res) => {
  const { last_name, first_name, patronymic, username, password, phone_number, email, birth_date, gender, image } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newCoach = await Coaches.create({
      last_name,
      first_name,
      patronymic,
      username,
      password: hashedPassword,
      phone_number,
      specialization,
      experience,
      email,
      birth_date,
      gender,
      image
    });

    res.status(201).json(newCoach);
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/admin/coaches/:id', async (req, res) => {
  try {
    const coach = await Coaches.findByPk(req.params.id);
    if (!coach) return res.status(404).json({ error: 'Тренер не найден' });

    await coach.update(req.body);
    res.json(coach);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/coaches/:id', async (req, res) => {
  try {
    const deleted = await Coaches.destroy({ where: { coachid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Тренер не найден' });

    res.json({ message: 'Тренер удалён' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
