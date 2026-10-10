const express = require('express');
const bcrypt = require('bcrypt');

const Coaches = require('../../models/Coach');
const Clients = require('../../models/Client');

const { currentUser, startSession, isAdmin } = require('../middlewares/auth');

const router = express.Router();

// Логины в БД не уникальны, а findOne без сортировки отдаёт строку в физическом
// порядке кучи — после любого UPDATE выбор молча менялся. Поэтому: сначала точное
// совпадение по username, потом по email, при дублях — самая старая запись.
const findAccount = async (Model, idField, login) => {
  const byUsername = await Model.findOne({
    where: { username: login },
    order: [[idField, 'ASC']]
  });
  if (byUsername) return byUsername;

  return Model.findOne({
    where: { email: login },
    order: [[idField, 'ASC']]
  });
};

// Вход для тренера
router.post('/login/coaches', async (req, res) => {
  const { username, password } = req.body;
  try {
    const coach = await findAccount(Coaches, 'coachid', username);

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

    await startSession(req, { id: coach.coachid, role: 'coach' });

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Вход для клиента
router.post('/login/clients', async (req, res) => {
  const { username, password } = req.body;
  try {
    const client = await findAccount(Clients, 'clientid', username);

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

    await startSession(req, { id: client.clientid, role: 'client' });

    res.status(200).json({ message: 'Login successful', user });
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

// Кто вошёл сейчас — единственный достоверный источник для фронта
router.get('/me', async (req, res) => {
  const session = currentUser(req);
  if (!session) {
    return res.status(401).json({ error: 'Требуется вход' });
  }

  try {
    const account = session.role === 'coach'
      ? await Coaches.findByPk(session.id)
      : await Clients.findByPk(session.id);

    if (!account) {
      return req.session.destroy(() => res.status(401).json({ error: 'Требуется вход' }));
    }

    res.json({ user: account, role: session.role, isAdmin: isAdmin(session) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/logout', (req, res) => {
  if (!req.session) {
    return res.json({ message: 'Logged out' });
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Не удалось завершить сессию' });
    }
    res.clearCookie('tt.sid');
    res.json({ message: 'Logged out' });
  });
});

module.exports = router;
