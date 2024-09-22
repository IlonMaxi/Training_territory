require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Подключаем модуль cors
const sequelize = require('../config/database'); // Убедитесь, что путь правильный
const { Sequelize } = require('sequelize'); // Импортируем Sequelize, если это необходимо


// Импортируем необходимые модули в начале файла
const bcrypt = require('bcrypt');

// Импорт моделей
const Coach = require('../models/Coach');
const Client = require('../models/Client');
const Exercise = require('../models/Exercise');
const Nutrition = require('../models/Nutrition');
const KgMeasurement = require('../models/KgMeasurement');
const SmMeasurement = require('../models/SmMeasurement');
const PercentageMeasurement = require('../models/PercentageMeasurement');
const Progress = require('../models/Progress');
const Schedule = require('../models/Schedule');
const UnitMeasurement = require('../models/UnitMeasurement');
const WeightsOnMachine = require('../models/WeightsOnMachine');
const Workout = require('../models/Workout');
const Payment = require('../models/Payment');

const app = express();
const { Op } = require('sequelize');


// Настройка CORS
app.use(cors({
  origin: 'http://25.22.135.216:3000' // Укажите ваш фронтенд адрес
}));

// Поддержка JSON тела запроса
app.use(bodyParser.json());

// Маршруты для тренеров
app.get('/coaches', async (req, res) => {
  try {
    const coaches = await Coach.findAll();
    res.json(coaches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Вход для тренера
app.post('/login/coaches', async (req, res) => {
  const { Логин, Пароль } = req.body;  // Изменено на Логин и Пароль
  try {
    const coach = await Coach.findOne({
      where: {
        [Op.or]: [{ Логин }, { Адрес_электронной_почты: Логин }]  // Поиск по Логину или Email
      }
    });

    if (!coach) {
      return res.status(404).json({ error: 'Тренер не найден' });
    }

    const isPasswordValid = await bcrypt.compare(Пароль, coach.Пароль);  // Проверка пароля
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неправильный пароль' });
    }

    res.status(200).json({ message: 'Вход успешен', user: coach });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/coaches', async (req, res) => {
  const { Фамилия, Имя, Отчество, Логин, Пароль, Номер_телефона, Адрес_электронной_почты, Дата_рождения, Пол } = req.body;

  try {
    // Хешируем пароль перед сохранением
    const hashedPassword = await bcrypt.hash(Пароль, 10);

    // Сохраняем тренера с захешированным паролем
    const newCoach = await Coach.create({
      Фамилия,
      Имя,
      Отчество,
      Логин,
      Пароль: hashedPassword, // Захешированный пароль
      Номер_телефона,
      Адрес_электронной_почты,
      Дата_рождения,
      Пол
    });

    res.status(201).json(newCoach);
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


// Маршруты для клиентов
app.get('/clients', async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Вход для клиента
app.post('/login/clients', async (req, res) => {
  const { Логин, Пароль } = req.body;  // Изменено на Логин и Пароль
  try {
    const client = await Client.findOne({
      where: {
        [Op.or]: [{ Логин }, { Адрес_электронной_почты: Логин }]  // Поиск по Логину или Email
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const isPasswordValid = await bcrypt.compare(Пароль, client.Пароль);  // Проверка пароля
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неправильный пароль' });
    }

    res.status(200).json({ message: 'Вход успешен', user: client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Пример обработки маршрута для регистрации пользователя
app.post('/clients', async (req, res) => {
  const { Фамилия, Имя, Отчество, Логин, Пароль, Номер_телефона, Адрес_электронной_почты, Дата_рождения, Пол } = req.body;

  try {
    // Хешируем пароль перед сохранением
    const hashedPassword = await bcrypt.hash(Пароль, 10);

    // Сохраняем пользователя с захешированным паролем
    const newUser = await Client.create({
      Фамилия,
      Имя,
      Отчество,
      Логин,
      Пароль: hashedPassword, // Захешированный пароль
      Номер_телефона,
      Адрес_электронной_почты,
      Дата_рождения,
      Пол
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Маршруты для упражнений
app.get('/exercises', async (req, res) => {
  try {
    const exercises = await Exercise.findAll();
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/exercises', async (req, res) => {
  try {
    const exercise = await Exercise.create(req.body);
    res.status(201).json(exercise);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для питания
app.get('/nutrition', async (req, res) => {
  try {
    const nutrition = await Nutrition.findAll();
    res.json(nutrition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/nutrition', async (req, res) => {
  try {
    const food = await Nutrition.create(req.body);
    res.status(201).json(food);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для замеров в килограммах
app.get('/kg-measurements', async (req, res) => {
  try {
    const measurements = await KgMeasurement.findAll();
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/kg-measurements', async (req, res) => {
  try {
    const measurement = await KgMeasurement.create(req.body);
    res.status(201).json(measurement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для замеров в сантиметрах
app.get('/sm-measurements', async (req, res) => {
  try {
    const measurements = await SmMeasurement.findAll();
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/sm-measurements', async (req, res) => {
  try {
    const measurement = await SmMeasurement.create(req.body);
    res.status(201).json(measurement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для процентных замеров
app.get('/percentage-measurements', async (req, res) => {
  try {
    const measurements = await PercentageMeasurement.findAll();
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/percentage-measurements', async (req, res) => {
  try {
    const measurement = await PercentageMeasurement.create(req.body);
    res.status(201).json(measurement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для прогресса
app.get('/progress', async (req, res) => {
  try {
    const progress = await Progress.findAll();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/progress', async (req, res) => {
  try {
    const progress = await Progress.create(req.body);
    res.status(201).json(progress);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для расписания
app.get('/schedule', async (req, res) => {
  try {
    const schedule = await Schedule.findAll();
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/schedule', async (req, res) => {
  try {
    const scheduleItem = await Schedule.create(req.body);
    res.status(201).json(scheduleItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/schedule/:coachid', async (req, res) => {
  const { coachid } = req.params; // Получаем ID тренера из параметров

  try {
    const schedule = await sequelize.query(`
      SELECT 
        s.scheduleid, 
        s.Дата, 
        s.Начало, 
        s.Место, 
        s.Время_окончания, 
        w.workoutid, 
        w.Название AS workout_name, 
        w.Описание AS workout_description,
        e.exercisesid,
        e.Название AS exercise_name,
        e.Описание AS exercise_description,
        e.Тренажёр AS equipment
      FROM 
        Расписание AS s
      JOIN 
        Тренировки AS w ON s.id_тренеровки = w.workoutid
      JOIN 
        Упражнения AS e ON w.id_упражнения = e.exercisesid
      WHERE 
        s.id_тренера = :coachid
    `, {
      replacements: { coachid },
      type: Sequelize.QueryTypes.SELECT
    });

    if (!schedule.length) {
      return res.status(404).json({ error: 'Расписание не найдено для данного тренера.' });
    }

    res.json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


// Маршруты для тренировок
app.get('/workouts', async (req, res) => {
  try {
    const workouts = await Workout.findAll();
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/workouts', async (req, res) => {
  try {
    const workout = await Workout.create(req.body);
    res.status(201).json(workout);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/workouts/:coachid', async (req, res) => {
  const { coachid } = req.params; // Получаем ID тренера из параметров

  try {
    // Поиск всех тренировок по ID тренера с включением информации об упражнениях
    const workouts = await Workout.findAll({
      where: {
        id_тренера: coachid // Фильтр по ID тренера
      }
    });

    if (!workouts.length) {
      return res.status(404).json({ error: 'Тренировки не найдены для данного тренера.' });
    }

    res.json(workouts); // Отправляем найденные тренировки в ответе
  } catch (error) {
    res.status(500).json({ error: error.message }); // Обработка ошибок
  }
});

// Маршруты для единичных замеров
app.get('/unit-measurements', async (req, res) => {
  try {
    const measurements = await UnitMeasurement.findAll();
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/unit-measurements', async (req, res) => {
  try {
    const measurement = await UnitMeasurement.create(req.body);
    res.status(201).json(measurement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для весов на тренажерах
app.get('/weights-on-machines', async (req, res) => {
  try {
    const weights = await WeightsOnMachine.findAll();
    res.json(weights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/weights-on-machines', async (req, res) => {
  try {
    const weight = await WeightsOnMachine.create(req.body);
    res.status(201).json(weight);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Маршруты для оплаты
app.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.findAll();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/payments', async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Регистрация пользователя
app.post('/register', async (req, res) => {
  const { name, email, password, userType } = req.body;

  try {
    // Хеширование пароля перед сохранением
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (userType === 'coach') {
      user = await Coach.create({
        Имя: name,
        Адрес_электронной_почты: email,
        Пароль: hashedPassword // Сохраняем захешированный пароль
      });
    } else {
      user = await Client.create({
        Имя: name,
        Адрес_электронной_почты: email,
        Пароль: hashedPassword // Сохраняем захешированный пароль
      });
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Экспортируйте приложение Express как middleware
module.exports = app;