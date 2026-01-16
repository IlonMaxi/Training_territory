const express = require('express');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

const Coaches = require('../../models/Coach');
const Clients = require('../../models/Client');

const router = express.Router();

// Вход для тренера
router.post('/login/coaches', async (req, res) => {
  const { username, password } = req.body;
  try {
    const coach = await Coaches.findOne({
      where: {
        [Op.or]: [{ username }, { email: username }]
      }
    });

    if (!coach) {
      return res.status(404).json({ error: 'Coach not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, coach.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const user = {
      coachid: coach.coachid,
      first_name: coach.first_name,
      last_name: coach.last_name,
      patronymic: coach.patronymic,
      username: coach.username,
      phone_number: coach.phone_number,
      email: coach.email,
      specialization: coach.specialization,
      experience: coach.experience,
      image: coach.image,
      gender: coach.gender
    };

    res.status(200).json({ message: 'Login successful', user: coach });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Вход для клиента
router.post('/login/clients', async (req, res) => {
  const { username, password } = req.body;
  try {
    const client = await Clients.findOne({
      where: {
        [Op.or]: [{ username }, { email: username }]
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, client.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const user = {
      clientid: client.clientid,
      first_name: client.first_name,
      last_name: client.last_name,
      patronymic: client.patronymic,
      username: client.username,
      phone_number: client.phone_number,
      email: client.email,
      image: client.image,
      gender: client.gender
    };

    res.status(200).json({ message: 'Login successful', user: client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Регистрация пользователя
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, userType, username, phoneNumber, birthDate } = req.body;

  if (!firstName || !lastName || !email || !password || !userType || !username || !phoneNumber || !birthDate) {
    return res.status(400).json({ error: 'All fields are required: firstName, lastName, email, password, userType, username, phoneNumber, birthDate' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (userType === 'coach') {
      user = await Coaches.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        username,
        phoneNumber,
        birthDate
      });
    } else {
      user = await Clients.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        username,
        phoneNumber,
        birthDate
      });
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
