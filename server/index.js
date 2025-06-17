require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

const nodemailer = require('nodemailer');

// Временное хранилище сообщений в памяти
const chatMessages = [];

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Модели
const Coaches = require('../models/Coach');
const Clients = require('../models/Client');
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
const Payments = require('../models/Payments');
const ClientSchedule = require('../models/ClientSchedule');
const Recipe = require('../models/Recipe');

// Ассоциации
require('../models/associations');

const multer = require('multer');
const path = require('path');

// Настройка хранилища для файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Папка для загрузки файлов
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Генерация уникального имени файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Статические файлы из папки uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Настройка CORS
app.use(cors({
  origin: 'http://26.100.29.243:3000' // Укажите ваш фронтенд адрес
}));

// Поддержка JSON тела запроса
app.use(bodyParser.json());

// ID администратора (укажи свой ID)
const ADMIN_ID = 1;

// Проверка доступа к админке
app.get('/admin/check-access', async (req, res) => {
  try {
    const userId = req.query.id; // Получаем ID пользователя из запроса

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const client = await Clients.findByPk(userId);

    if (!client) {
      return res.status(404).json({ error: "User not found" });
    }

    if (client.clientid == ADMIN_ID) {
      res.status(200).json({ access: true });
    } else {
      res.status(403).json({ error: "Access denied" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Вход для тренера
app.post('/login/coaches', async (req, res) => {
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

app.post('/coaches', async (req, res) => {
  const { last_name, first_name, patronymic, username, password, phone_number, email, birth_date, gender } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newCoach = await Coaches.create({
      last_name,
      first_name,
      patronymic,
      username,
      password: hashedPassword,
      phone_number,
      email,
      birth_date,
      gender
    });

    res.status(201).json(newCoach);
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Вход для клиента
app.post('/login/clients', async (req, res) => {
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

// Регистрация клиента
app.post('/clients', async (req, res) => {
  const { last_name, first_name, patronymic, username, password, phone_number, email, birth_date, gender } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Clients.create({
      last_name,
      first_name,
      patronymic,
      username,
      password: hashedPassword,
      phone_number,
      email,
      birth_date,
      gender
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Registration error:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Обновление данных клиента
app.put('/clients/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    patronymic,
    username,
    phone_number,
    email,
    gender
  } = req.body;

  try {
    const client = await Clients.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    await client.update({
      first_name,
      last_name,
      patronymic,
      username,
      phone_number,
      email,
      gender,
      image: req.file ? req.file.filename : client.image
    });

    res.status(200).json({ message: 'Данные клиента обновлены', user: client });
  } catch (error) {
    console.error('Ошибка обновления данных клиента:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.put('/coaches/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    patronymic,
    username,
    phone_number,
    email,
    specialization,
    experience,
    gender
  } = req.body;

  try {
    const coach = await Coaches.findByPk(id);
    if (!coach) {
      return res.status(404).json({ error: 'Тренер не найден' });
    }

    await coach.update({
      first_name,
      last_name,
      patronymic,
      username,
      phone_number,
      email,
      specialization,
      experience,
      gender,
      image: req.file ? req.file.filename : coach.image
    });

    res.status(200).json({ message: 'Данные тренера обновлены', user: coach });
  } catch (error) {
    console.error('Ошибка обновления тренера:', error);
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

app.get('/schedule/:coachId', async (req, res) => {
  const { coachId } = req.params;

  try {
    const schedule = await sequelize.query(`
      SELECT 
        s.scheduleid AS scheduleId, 
        s.date, 
        s.start_time AS startTime, 
        s.location, 
        s.end_time AS endTime, 
        w.workoutid AS workoutId, 
        w.name AS workout_name, 
        w.description AS workout_description,
        e.exerciseid AS exerciseId,
        e.name AS exercise_name,
        e.description AS exercise_description,
        e.machine AS equipment
      FROM 
        schedule AS s
      JOIN 
        workouts AS w ON s.workout_id = w.workoutid
      JOIN 
        exercises AS e ON w.exercise_id = e.exerciseid
      WHERE 
        s.coach_id = :coachId
    `, {
      replacements: { coachId },
      type: Sequelize.QueryTypes.SELECT
    });

    if (!schedule.length) {
      return res.status(404).json({ error: 'Расписание не найдено для этого тренера.' });
    }

    res.json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/schedule/client/:clientId', async (req, res) => {
  const { clientId } = req.params;

  try {
    const schedule = await sequelize.query(`
      SELECT 
        s.scheduleid AS scheduleId, 
        s.date, 
        s.start_time AS startTime, 
        s.location, 
        s.end_time AS endTime, 
        w.workoutid AS workoutId, 
        w.name AS workout_name, 
        w.description AS workout_description,
        e.exerciseid AS exerciseId,
        e.name AS exercise_name,
        e.description AS exercise_description,
        e.machine AS equipment,
        c.clientid AS clientId,
        c.last_name AS client_lastname,
        c.first_name AS client_firstname
      FROM 
        schedule AS s
      JOIN 
        workouts AS w ON s.workout_id = w.workoutid
      JOIN 
        exercises AS e ON w.exercise_id = e.exerciseid
      JOIN 
        client_schedule AS cs ON s.scheduleid = cs.schedule_id
      JOIN 
        clients AS c ON cs.client_id = c.clientid
      WHERE 
        c.clientid = :clientId
    `, {
      replacements: { clientId },
      type: Sequelize.QueryTypes.SELECT
    });

    if (!schedule.length) {
      return res.status(404).json({ error: 'Расписание не найдено для этого клиента.' });
    }

    res.json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/nutrition/client/:clientId', async (req, res) => {
  const { clientId } = req.params;

  try {
    const nutritionData = await sequelize.query(`
  SELECT 
    f.foodid AS foodId, 
    f.name AS food_name,
    f.protein_amount AS proteins, 
    f.fat_amount AS fats, 
    f.carbohydrate_amount AS carbohydrates,
    f.calories AS calories,
    f.weight AS weight, -- ✅ вот это добавь!
    f.date AS food_date,
    f.meal_type AS meal_type,
    r.recipeid AS recipeId,
    r.name AS recipe_name,
    r.ingredients AS ingredients,
    r.preparation_time AS preparation_time,
    r.instructions AS instructions
  FROM 
    nutrition AS f
  LEFT JOIN 
    recipes AS r ON f.recipe_id = r.recipeid
  WHERE 
    f.client_id = :clientId
`, {
      replacements: { clientId },
      type: Sequelize.QueryTypes.SELECT
    });

    if (!nutritionData.length) {
      return res.status(404).json({ error: 'Данные о питании не найдены для этого клиента.' });
    }

    res.json(nutritionData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const cron = require('node-cron');

const MEALS = [
  { name: 'Завтрак', ratio: 0.25 },
  { name: 'Обед', ratio: 0.375 },
  { name: 'Ужин', ratio: 0.375 }
];

// Базовая калорийность по полу
const getBaseCalories = (gender) => {
  return gender === 'female' ? 1800 : 2200;
};

// Бонус калорий в зависимости от типа и сложности тренировки
const getWorkoutBonus = (type, difficulty) => {
  if (!type || !difficulty) return 0;
  type = type.toLowerCase();
  difficulty = difficulty.toLowerCase();

  if (type === 'силовая') {
    if (difficulty === 'высокий') return 800;
    if (difficulty === 'средний') return 600;
    return 400;
  }

  if (type === 'кардио') {
    if (difficulty === 'высокий') return 600;
    if (difficulty === 'средний') return 400;
    return 300;
  }

  if (type === 'функциональная') {
    if (difficulty === 'высокий') return 500;
    if (difficulty === 'средний') return 350;
    return 250;
  }

  if (type === 'круговая') {
    if (difficulty === 'высокий') return 550;
    if (difficulty === 'средний') return 400;
    return 300;
  }

  return 0;
};

// Главная функция генерации питания
const generateNutritionSchedule = async () => {
  console.log('🚀 Запуск генерации питания...');
  try {
    const clients = await Clients.findAll();
    const allRecipes = await Recipe.findAll();

    if (!clients.length || !allRecipes.length) {
      console.log('❌ Нет клиентов или рецептов.');
      return;
    }

    for (const client of clients) {
      const clientId = client.clientid;
      const gender = client.gender || 'male';

      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (let i = 0; i < 7; i++) {
        const dateOnly = new Date(currentDate);
        dateOnly.setHours(0, 0, 0, 0);

        // Получаем тренировку клиента через client_schedule → schedule → workout
        const scheduleEntry = await ClientSchedule.findOne({
          where: { client_id: clientId },
          include: [{
            model: Schedule,
            as: 'schedule',
            where: { date: dateOnly },
            include: [{
              model: Workout,
              as: 'workout'
            }]
          }]
        });

        const workout = scheduleEntry?.schedule?.workout;

        const baseCalories = getBaseCalories(gender);
        const bonusCalories = getWorkoutBonus(workout?.workout_type, workout?.difficulty);
        const variation = Math.floor(Math.random() * 151) - 75;
        const totalCalories = baseCalories + bonusCalories + variation;

        const existingNutritions = await Nutrition.findAll({
          where: {
            client_id: clientId,
            date: dateOnly
          }
        });

        for (const meal of MEALS) {
          const mealCalories = Math.round(totalCalories * meal.ratio);

          const suitableRecipes = allRecipes.filter(r =>
            r.calories >= mealCalories - 100 && r.calories <= mealCalories + 100
          );

          const selectedRecipe = (suitableRecipes.length
            ? suitableRecipes
            : allRecipes)[Math.floor(Math.random() * (suitableRecipes.length || allRecipes.length))];

          const actualCalories = selectedRecipe.calories || mealCalories;

          const generatedWeight = Math.max(150, Math.min(
            Math.floor((actualCalories / 2.5) + (Math.random() * 100 - 50)),
            600
          ));

          const mealData = {
            name: selectedRecipe.name,
            protein_amount: +(actualCalories * 0.3 / 4).toFixed(2),
            fat_amount: +(actualCalories * 0.25 / 9).toFixed(2),
            carbohydrate_amount: +(actualCalories * 0.45 / 4).toFixed(2),
            calories: actualCalories,
            weight: generatedWeight,
            water_amount: Math.round(Math.random() * 500 + 1500),
            date: new Date(dateOnly),
            client_id: clientId,
            recipe_id: selectedRecipe.recipeid,
            meal_type: meal.name
          };

          const existingMeal = existingNutritions.find(n => n.meal_type === meal.name);
          if (existingMeal) {
            await existingMeal.update(mealData);
            console.log(`🔄 Обновлено (${meal.name}) для клиента ${clientId} на ${dateOnly.toDateString()}`);
          } else {
            await Nutrition.create(mealData);
            console.log(`➕ Добавлено (${meal.name}) для клиента ${clientId} на ${dateOnly.toDateString()}`);
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  } catch (error) {
    console.error('❗ Ошибка генерации питания:', error);
  }
};

// Первый запуск
(async () => {
  console.log('Первый запуск: генерация расписания...');
  await generateNutritionSchedule();
})();

// Плановая генерация каждый день
cron.schedule('0 0 * * *', async () => {
  console.log('Запуск плановой генерации питания...');
  await generateNutritionSchedule();
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

app.get('/workouts/:coachId', async (req, res) => {
  const { coachId } = req.params;

  try {
    const workouts = await Workout.findAll({
      where: {
        coach_id: coachId
      }
    });

    if (!workouts.length) {
      return res.status(404).json({ error: 'Workouts not found for this coach.' });
    }

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// Получить все записи
app.get('/admin/weights-on-machines', async (req, res) => {
  try {
    const weights = await WeightsOnMachine.findAll();
    res.json(weights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новую запись
app.post('/admin/weights-on-machines', async (req, res) => {
  try {
    const { machine_weight, date } = req.body;
    const newWeight = await WeightsOnMachine.create({ machine_weight, date });
    res.status(201).json(newWeight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить запись по ID
app.put('/admin/weights-on-machines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { machine_weight, date } = req.body;

    const weight = await WeightsOnMachine.findByPk(id);
    if (!weight) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    await weight.update({ machine_weight, date });
    res.json(weight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить запись по ID
app.delete('/admin/weights-on-machines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await WeightsOnMachine.destroy({ where: { weightid: id } });

    if (!deleted) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    res.json({ message: 'Запись удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить всех клиентов
app.get('/admin/clients', async (req, res) => {
  try {
    const clients = await Clients.findAll();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создать клиента
app.post('/admin/clients', async (req, res) => {
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

// Обновить клиента
app.put('/admin/clients/:id', async (req, res) => {
  try {
    const client = await Clients.findByPk(req.params.id);
    if (!client) return res.status(404).json({ error: 'Клиент не найден' });
    await client.update(req.body);
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить клиента
app.delete('/admin/clients/:id', async (req, res) => {
  try {
    const deleted = await Clients.destroy({ where: { clientid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Клиент не найден' });
    res.json({ message: 'Клиент удалён' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить все оплаты
app.get('/admin/payments', async (req, res) => {
  try {
    const payments = await Payments.findAll();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новую оплату
app.post('/admin/payments', async (req, res) => {
  try {
    const payment = await Payments.create(req.body);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить оплату
app.delete('/admin/payments/:id', async (req, res) => {
  try {
    const deleted = await Payments.destroy({ where: { paymentid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Оплата не найдена' });

    res.json({ message: 'Оплата удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить оплату по ID
app.put('/admin/payments/:id', async (req, res) => {
  try {
    const payment = await Payments.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Оплата не найдена' });

    await payment.update(req.body);
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить всех тренеров
app.get('/admin/coaches', async (req, res) => {
  try {
    const coaches = await Coaches.findAll();
    res.json(coaches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать тренера
app.post('/admin/coaches', async (req, res) => {
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

// Обновить тренера
app.put('/admin/coaches/:id', async (req, res) => {
  try {
    const coach = await Coaches.findByPk(req.params.id);
    if (!coach) return res.status(404).json({ error: 'Тренер не найден' });

    await coach.update(req.body);
    res.json(coach);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить тренера
app.delete('/admin/coaches/:id', async (req, res) => {
  try {
    const deleted = await Coaches.destroy({ where: { coachid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Тренер не найден' });

    res.json({ message: 'Тренер удалён' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все записи о питании
app.get('/admin/nutrition', async (req, res) => {
  try {
    const nutrition = await Nutrition.findAll();
    res.json(nutrition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать запись
app.post('/admin/nutrition', async (req, res) => {
  try {
    const newRecord = await Nutrition.create(req.body);
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить запись
app.put('/admin/nutrition/:id', async (req, res) => {
  try {
    const record = await Nutrition.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: 'Запись не найдена' });

    await record.update(req.body);
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить запись
app.delete('/admin/nutrition/:id', async (req, res) => {
  try {
    const deleted = await Nutrition.destroy({ where: { foodid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Запись не найдена' });

    res.json({ message: 'Запись удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все рецепты
app.get('/admin/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.findAll();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать рецепт
app.post('/admin/recipes', async (req, res) => {
  try {
    const newRecipe = await Recipe.create(req.body);
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить рецепт
app.put('/admin/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Рецепт не найден' });

    await recipe.update(req.body);
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить рецепт
app.delete('/admin/recipes/:id', async (req, res) => {
  try {
    const deleted = await Recipe.destroy({ where: { recipeid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Рецепт не найден' });

    res.json({ message: 'Рецепт удалён' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить всё расписание с тренером и тренировкой
app.get('/admin/schedule', async (req, res) => {
  try {
    const schedules = await Schedule.findAll({
      include: [
        { model: Coaches, as: 'coach' },
        { model: Workout, as: 'workout' },
      ],
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать расписание
app.post('/admin/schedule', async (req, res) => {
  try {
    const schedule = await Schedule.create(req.body);
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить расписание
app.put('/admin/schedule/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Расписание не найдено' });

    await schedule.update(req.body);
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить расписание
app.delete('/admin/schedule/:id', async (req, res) => {
  try {
    const deleted = await Schedule.destroy({ where: { scheduleid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Расписание не найдено' });

    res.json({ message: 'Расписание удалено' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все client_schedule с ассоциациями
app.get('/admin/client-schedule', async (req, res) => {
  try {
    const records = await ClientSchedule.findAll({
      include: [
        {
          model: Clients,
          as: 'client' // 👈 ОБЯЗАТЕЛЬНО
        },
        {
          model: Schedule,
          as: 'schedule', // 👈 ОБЯЗАТЕЛЬНО
          include: [
            { model: Coaches, as: 'coach' }, // 👈 ОБЯЗАТЕЛЬНО
            { model: Workout, as: 'workout' } // 👈 ОБЯЗАТЕЛЬНО
          ]
        }
      ],
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новую запись
app.post('/admin/client-schedule', async (req, res) => {
  try {
    const record = await ClientSchedule.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить по ID
app.put('/admin/client-schedule/:id', async (req, res) => {
  try {
    const record = await ClientSchedule.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: 'Запись не найдена' });

    await record.update(req.body);
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить по ID
app.delete('/admin/client-schedule/:id', async (req, res) => {
  try {
    const deleted = await ClientSchedule.destroy({ where: { clientscheduleid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Запись не найдена' });

    res.json({ message: 'Запись удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все тренировки
app.get('/admin/workouts', async (req, res) => {
  try {
    const workouts = await Workout.findAll();
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать тренировку
app.post('/admin/workouts', async (req, res) => {
  try {
    const created = await Workout.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить тренировку
app.put('/admin/workouts/:id', async (req, res) => {
  try {
    const workout = await Workout.findByPk(req.params.id);
    if (!workout) return res.status(404).json({ error: 'Тренировка не найдена' });

    await workout.update(req.body);
    res.json(workout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить тренировку
app.delete('/admin/workouts/:id', async (req, res) => {
  try {
    const deleted = await Workout.destroy({ where: { workoutid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Тренировка не найдена' });

    res.json({ message: 'Тренировка удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все упражнения
app.get('/admin/exercises', async (req, res) => {
  try {
    const exercises = await Exercise.findAll();
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать упражнение
app.post('/admin/exercises', async (req, res) => {
  try {
    const created = await Exercise.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить упражнение
app.put('/admin/exercises/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findByPk(req.params.id);
    if (!exercise) return res.status(404).json({ error: 'Упражнение не найдено' });

    await exercise.update(req.body);
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить упражнение
app.delete('/admin/exercises/:id', async (req, res) => {
  try {
    const deleted = await Exercise.destroy({ where: { exerciseid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Упражнение не найдено' });

    res.json({ message: 'Упражнение удалено' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все измерения в килограммах
app.get('/admin/kg-measurements', async (req, res) => {
  try {
    const measurements = await KgMeasurement.findAll();
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новое измерение в килограммах
app.post('/admin/kg-measurements', async (req, res) => {
  try {
    const newMeasurement = await KgMeasurement.create(req.body);
    res.status(201).json(newMeasurement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить измерение в килограммах по ID
app.put('/admin/kg-measurements/:id', async (req, res) => {
  try {
    const measurement = await KgMeasurement.findByPk(req.params.id);
    if (!measurement) return res.status(404).json({ error: 'Измерение не найдено' });

    await measurement.update(req.body);
    res.json(measurement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить измерение в килограммах по ID
app.delete('/admin/kg-measurements/:id', async (req, res) => {
  try {
    const deleted = await KgMeasurement.destroy({ where: { kilogramid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Измерение не найдено' });

    res.json({ message: 'Измерение удалено' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все измерения в сантиметрах
app.get('/admin/cm-measurements', async (req, res) => {
  try {
    const measurements = await SmMeasurement.findAll();
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новое измерение в сантиметрах
app.post('/admin/cm-measurements', async (req, res) => {
  try {
    const newMeasurement = await SmMeasurement.create(req.body);
    res.status(201).json(newMeasurement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить измерение в сантиметрах по ID
app.put('/admin/cm-measurements/:id', async (req, res) => {
  try {
    const measurement = await SmMeasurement.findByPk(req.params.id);
    if (!measurement) return res.status(404).json({ error: 'Измерение не найдено' });

    await measurement.update(req.body);
    res.json(measurement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить измерение в сантиметрах по ID
app.delete('/admin/cm-measurements/:id', async (req, res) => {
  try {
    const deleted = await SmMeasurement.destroy({ where: { centimetreid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Измерение не найдено' });

    res.json({ message: 'Измерение удалено' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все процентные измерения
app.get('/admin/percentage-measurements', async (req, res) => {
  try {
    const measurements = await PercentageMeasurement.findAll();
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новое процентное измерение
app.post('/admin/percentage-measurements', async (req, res) => {
  try {
    const newMeasurement = await PercentageMeasurement.create(req.body);
    res.status(201).json(newMeasurement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить процентное измерение по ID
app.put('/admin/percentage-measurements/:id', async (req, res) => {
  try {
    const measurement = await PercentageMeasurement.findByPk(req.params.id);
    if (!measurement) return res.status(404).json({ error: 'Измерение не найдено' });

    await measurement.update(req.body);
    res.json(measurement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить процентное измерение по ID
app.delete('/admin/percentage-measurements/:id', async (req, res) => {
  try {
    const deleted = await PercentageMeasurement.destroy({ where: { percentageid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Измерение не найдено' });

    res.json({ message: 'Измерение удалено' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все единичные измерения
app.get('/admin/unit-measurements', async (req, res) => {
  try {
    const measurements = await UnitMeasurement.findAll();
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новое единичное измерение
app.post('/admin/unit-measurements', async (req, res) => {
  try {
    const newMeasurement = await UnitMeasurement.create(req.body);
    res.status(201).json(newMeasurement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить единичное измерение по ID
app.put('/admin/unit-measurements/:id', async (req, res) => {
  try {
    const measurement = await UnitMeasurement.findByPk(req.params.id);
    if (!measurement) return res.status(404).json({ error: 'Измерение не найдено' });

    await measurement.update(req.body);
    res.json(measurement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить единичное измерение по ID
app.delete('/admin/unit-measurements/:id', async (req, res) => {
  try {
    const deleted = await UnitMeasurement.destroy({ where: { measurementid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Измерение не найдено' });

    res.json({ message: 'Измерение удалено' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/admin/progress', async (req, res) => {
  try {
    const records = await Progress.findAll({
      include: [
        { model: Clients, as: 'client' },
        { model: UnitMeasurement, as: 'unitMeasurement' },
        { model: PercentageMeasurement, as: 'percentageMeasurement' },
        { model: KgMeasurement, as: 'kilogramMeasurement' },
        { model: SmMeasurement, as: 'centimetreMeasurement' },
        { model: WeightsOnMachine, as: 'weight' }
      ]
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/admin/progress', async (req, res) => {
  try {
    const progress = await Progress.create(req.body);
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/admin/progress/:id', async (req, res) => {
  try {
    const progress = await Progress.findByPk(req.params.id);
    if (!progress) return res.status(404).json({ error: 'Прогресс не найден' });

    await progress.update(req.body);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/admin/progress/:id', async (req, res) => {
  try {
    const deleted = await Progress.destroy({ where: { progressid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Прогресс не найден' });

    res.json({ message: 'Прогресс удалён' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Маршрут для назначения новой тренировки клиенту
app.post('/coaches/:coachId/assign-training', async (req, res) => {
  const { coachId } = req.params;
  const { client_id, workout_id, date, start_time, end_time, location } = req.body;

  // Логирование входных данных для отладки
  console.log('Назначение тренировки, тренер ID:', coachId);
  console.log('Данные тренировки:', req.body);

  // Проверка наличия всех необходимых полей
  if (!client_id || !workout_id || !date || !start_time || !end_time || !location) {
    return res.status(400).json({ error: 'Все поля обязательны для заполнения.' });
  }

  // Начало транзакции
  const transaction = await sequelize.transaction();

  try {
    // Проверка существования тренера
    const coach = await Coaches.findByPk(coachId, { transaction });
    if (!coach) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Тренер не найден.' });
    }

    // Проверка существования клиента и принадлежности тренеру
    const client = await Clients.findOne({ where: { clientid: client_id, coach_id: coachId }, transaction });
    if (!client) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Клиент не найден или не принадлежит этому тренеру.' });
    }

    // Проверка существования тренировки и принадлежности тренеру
    const workout = await Workout.findOne({ where: { workoutid: workout_id, coach_id: coachId }, transaction });
    if (!workout) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Тренировка не найдена или не принадлежит этому тренеру.' });
    }

    // Дополнительная проверка на конфликт расписания (опционально)
    const existingSchedule = await Schedule.findOne({
      where: {
        coach_id: coachId,
        date,
        [Op.or]: [
          {
            start_time: {
              [Op.between]: [start_time, end_time]
            }
          },
          {
            end_time: {
              [Op.between]: [start_time, end_time]
            }
          },
          {
            [Op.and]: [
              { start_time: { [Op.lte]: start_time } },
              { end_time: { [Op.gte]: end_time } }
            ]
          }
        ]
      },
      transaction
    });

    if (existingSchedule) {
      await transaction.rollback();
      return res.status(400).json({ error: 'В это время уже запланирована другая тренировка.' });
    }

    // Создание новой записи в расписании
    const newSchedule = await Schedule.create({
      date,
      start_time,
      end_time,
      location,
      workout_id,
      coach_id: coachId
    }, { transaction });

    // Связывание клиента с расписанием
    await ClientSchedule.create({ // Используем правильное имя модели
      client_id,
      schedule_id: newSchedule.scheduleid,
      status: 'scheduled' // Можно изменить статус при необходимости
    }, { transaction });

    // Фиксация транзакции
    await transaction.commit();

    res.status(201).json({
      message: 'Тренировка успешно назначена.',
      schedule: newSchedule
    });
  } catch (error) {
    // Откат транзакции в случае ошибки
    await transaction.rollback();
    console.error('Ошибка при назначении тренировки:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
  }
});

// Регистрация пользователя
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, userType, username, phoneNumber, birthDate } = req.body;

  // Обновленная проверка обязательных полей
  if (!firstName || !lastName || !email || !password || !userType || !username || !phoneNumber || !birthDate) {
    return res.status(400).json({ error: 'All fields are required: firstName, lastName, email, password, userType, username, phoneNumber, birthDate' });
  }

  try {
    // Хеширование пароля перед сохранением
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

// Маршрут для получения тренировок тренера
app.get('/coaches/:coachId/workouts', async (req, res) => {
  const { coachId } = req.params;

  try {
    // Проверка существования тренера
    const coach = await Coaches.findByPk(coachId);
    if (!coach) {
      return res.status(404).json({ error: 'Тренер не найден' });
    }

    // Получение тренировок, созданных тренером
    const workouts = await Workout.findAll({
      where: { coach_id: coachId },
      attributes: ['workoutid', 'name', 'description', 'difficulty', 'duration', 'workout_type', 'max_participants']
    });

    res.json(workouts);
  } catch (error) {
    console.error('Ошибка при получении тренировок:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить тренера по ID клиента
app.get('/clients/:clientId/coach', async (req, res) => {
  const { clientId } = req.params;

  try {
    // Находим клиента
    const client = await Clients.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    // Находим тренера по coach_id клиента
    const coach = await Coaches.findByPk(client.coach_id);
    if (!coach) {
      return res.status(404).json({ error: 'Тренер не найден' });
    }

    res.json(coach);
  } catch (error) {
    console.error('Ошибка при получении тренера клиента:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение всех тренеров
app.get('/coaches', async (req, res) => {
  const coaches = await Coaches.findAll();
  res.json(coaches);
});

// Назначение тренера клиенту
app.post('/clients/:clientId/coach', async (req, res) => {
  const { coachId } = req.body;
  await Clients.update({ coach_id: coachId }, { where: { clientid: req.params.clientId } });
  res.json({ message: 'Тренер назначен' });
});

// Удаление тренера у клиента
app.delete('/clients/:clientId/coach', async (req, res) => {
  const { clientId } = req.params;
  try {
    const client = await Clients.findByPk(clientId);
    if (!client) return res.status(404).json({ error: 'Клиент не найден' });

    client.coach_id = null; // Сбросить тренера
    await client.save();

    res.json({ message: 'Тренер успешно убран' });
  } catch (error) {
    console.error('Ошибка при удалении тренера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Маршрут для получения данных клиента по ID
app.get('/clients/:clientId', async (req, res) => {
  const { clientId } = req.params;

  try {
    // Находим клиента в базе данных
    const client = await Clients.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    // Получаем имя файла фото клиента
    const photoUrl = client.image || 'default.jpg'; // если фото нет, показываем фото по умолчанию

    // Возвращаем данные клиента, включая имя фотографии
    res.json({
      clientId: client.clientid,
      firstName: client.first_name,
      lastName: client.last_name,
      email: client.email,
      phoneNumber: client.phone_number,
      birthDate: client.birth_date,
      gender: client.gender,
      imageUrl: photoUrl,  // Только имя файла фотографии
    });
  } catch (error) {
    console.error('Ошибка при получении данных клиента:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/clients/:clientId/progress-summary', async (req, res) => {
  const { clientId } = req.params;

  try {
    const [firstProgress, lastProgress] = await Promise.all([
      Progress.findOne({ where: { client_id: clientId }, order: [['progressid', 'ASC']] }),
      Progress.findOne({ where: { client_id: clientId }, order: [['progressid', 'DESC']] })
    ]);

    if (!firstProgress || !lastProgress) {
      return res.status(404).json({ error: 'Недостаточно данных для вычисления прогресса.' });
    }

    const [
      firstUnit, lastUnit,
      firstKg, lastKg,
      firstCm, lastCm,
      firstPerc, lastPerc
    ] = await Promise.all([
      UnitMeasurement.findByPk(firstProgress.unit_measurement_id),
      UnitMeasurement.findByPk(lastProgress.unit_measurement_id),

      KgMeasurement.findByPk(firstProgress.kilogram_measurement_id),
      KgMeasurement.findByPk(lastProgress.kilogram_measurement_id),

      SmMeasurement.findByPk(firstProgress.centimetre_measurement_id),
      SmMeasurement.findByPk(lastProgress.centimetre_measurement_id),

      PercentageMeasurement.findByPk(firstProgress.percentage_measurement_id),
      PercentageMeasurement.findByPk(lastProgress.percentage_measurement_id)
    ]);

    const percentOrZero = (first, last) =>
      first && last && parseFloat(first) !== 0
        ? Math.round(((parseFloat(last) - parseFloat(first)) / parseFloat(first)) * 100)
        : 0;

    const buildProgress = (first, last, keys) => {
      const result = {};
      keys.forEach(key => {
        const a = parseFloat(first?.[key]);
        const b = parseFloat(last?.[key]);
        result[key] = (a && b && a !== 0) ? Math.round(((b - a) / a) * 100) : 0;
      });
      return result;
    };

    const cmKeys = [
      'chest_circumference', 'waist_circumference', 'hip_circumference',
      'bicep_circumference', 'forearm_circumference', 'quadriceps_circumference',
      'calf_circumference', 'thigh_circumference', 'neck_circumference',
      'waist_inhale_circumference'
    ];

    const cmProgress = buildProgress(
      firstCm?.toJSON?.(), lastCm?.toJSON?.(), cmKeys
    );

    const result = {
      // Измерения в килограммах
      'Вес': percentOrZero(firstKg?.weight, lastKg?.weight),
      'Жировая масса': percentOrZero(firstKg?.fat_mass, lastKg?.fat_mass),
      'Мышечная масса': percentOrZero(firstKg?.muscle_mass, lastKg?.muscle_mass),
      'Содержание воды': percentOrZero(firstKg?.water_content, lastKg?.water_content),
      'Скелетная масса': percentOrZero(firstKg?.skeletal_mass, lastKg?.skeletal_mass),
      'Костная масса': percentOrZero(firstKg?.bone_mass, lastKg?.bone_mass),
      'Масса без жира': percentOrZero(firstKg?.lbm, lastKg?.lbm),

      // Единичные измерения
      'Индекс массы тела': percentOrZero(firstUnit?.bmi, lastUnit?.bmi),
      'Метаболизм': percentOrZero(firstUnit?.metabolism, lastUnit?.metabolism),
      'Возраст тела': percentOrZero(firstUnit?.body_age, lastUnit?.body_age),

      // Измерения в процентах
      'Процент жира': percentOrZero(firstPerc?.fat_percentage, lastPerc?.fat_percentage),
      'Процент скелетных мышц': percentOrZero(firstPerc?.skeletal_mass_percentage, lastPerc?.skeletal_mass_percentage),
      'Динамика мышц': percentOrZero(firstPerc?.muscle_dynamics, lastPerc?.muscle_dynamics),
      'Вода в организме': percentOrZero(firstPerc?.body_water, lastPerc?.body_water),
      'Белок': percentOrZero(firstPerc?.protein, lastPerc?.protein),
      'Жировое содержание': percentOrZero(firstPerc?.fat_content, lastPerc?.fat_content),

      // Объёмы тела в сантиметрах
      'Обхват груди': cmProgress.chest_circumference,
      'Обхват талии': cmProgress.waist_circumference,
      'Обхват бёдер': cmProgress.hip_circumference,
      'Обхват бицепса': cmProgress.bicep_circumference,
      'Обхват предплечья': cmProgress.forearm_circumference,
      'Обхват квадрицепса': cmProgress.quadriceps_circumference,
      'Обхват икры': cmProgress.calf_circumference,
      'Обхват бедра': cmProgress.thigh_circumference,
      'Обхват шеи': cmProgress.neck_circumference,
      'Обхват талии при вдохе': cmProgress.waist_inhale_circumference,

      // Анализ
      'Анализ замеров': lastProgress.measurement_analysis || '',
      'Анализ веса': lastProgress.weight_analysis || '',
      'Полный анализ замеров': lastProgress.full_measurement_analysis || '',
      'Полный анализ веса': lastProgress.full_weight_analysis || ''
    };

    res.json(result);
  } catch (error) {
    console.error('Ошибка при вычислении прогресса:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/clients/:id/unit-measurements-history', async (req, res) => {
  const { id: clientId } = req.params;

  try {
    const history = await Progress.findAll({
      where: { client_id: clientId },
      include: [{ model: UnitMeasurement, as: 'unitMeasurement' }],
      order: [['progressid', 'ASC']]
    });

    const result = history
      .filter(p => p.unitMeasurement)
      .map(p => ({
        date: p.unitMeasurement.date,
        bmi: parseFloat(p.unitMeasurement.bmi),
        metabolism: parseFloat(p.unitMeasurement.metabolism),
        body_age: parseFloat(p.unitMeasurement.body_age)
      }));

    res.json(result);
  } catch (error) {
    console.error('Ошибка при получении истории замеров в единицах:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/clients/:id/kg-measurements-history', async (req, res) => {
  const { id: clientId } = req.params;

  try {
    const history = await Progress.findAll({
      where: { client_id: clientId },
      include: [{ model: KgMeasurement, as: 'kilogramMeasurement' }],
      order: [['progressid', 'ASC']]
    });

    const result = history
      .filter(p => p.kilogramMeasurement)
      .map(p => ({
        date: p.kilogramMeasurement.date,
        weight: parseFloat(p.kilogramMeasurement.weight),
        fat_mass: parseFloat(p.kilogramMeasurement.fat_mass),
        skeletal_mass: parseFloat(p.kilogramMeasurement.skeletal_mass),
        muscle_mass: parseFloat(p.kilogramMeasurement.muscle_mass),
        water_content: parseFloat(p.kilogramMeasurement.water_content),
        bone_mass: parseFloat(p.kilogramMeasurement.bone_mass),
        lbm: parseFloat(p.kilogramMeasurement.lbm)
      }));

    res.json(result);
  } catch (error) {
    console.error('Ошибка при получении истории в килограммах:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/clients/:id/cm-measurements-history', async (req, res) => {
  const { id: clientId } = req.params;

  try {
    const history = await Progress.findAll({
      where: { client_id: clientId },
      include: [{ model: SmMeasurement, as: 'centimetreMeasurement' }],
      order: [['progressid', 'ASC']]
    });

    const result = history
      .filter(p => p.centimetreMeasurement)
      .map(p => {
        const cm = p.centimetreMeasurement;
        return {
          date: cm.date,
          chest_circumference: parseFloat(cm.chest_circumference),
          waist_circumference: parseFloat(cm.waist_circumference),
          hip_circumference: parseFloat(cm.hip_circumference),
          bicep_circumference: parseFloat(cm.bicep_circumference),
          forearm_circumference: parseFloat(cm.forearm_circumference),
          quadriceps_circumference: parseFloat(cm.quadriceps_circumference),
          calf_circumference: parseFloat(cm.calf_circumference),
          thigh_circumference: parseFloat(cm.thigh_circumference),
          neck_circumference: parseFloat(cm.neck_circumference),
          waist_inhale_circumference: parseFloat(cm.waist_inhale_circumference)
        };
      });

    res.json(result);
  } catch (error) {
    console.error('Ошибка при получении истории замеров в сантиметрах:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/clients/:id/percentage-measurements-history', async (req, res) => {
  const { id: clientId } = req.params;

  try {
    const history = await Progress.findAll({
      where: { client_id: clientId },
      include: [{ model: PercentageMeasurement, as: 'percentageMeasurement' }],
      order: [['progressid', 'ASC']]
    });

    const result = history
      .filter(p => p.percentageMeasurement)
      .map(p => {
        const perc = p.percentageMeasurement;
        return {
          date: perc.date,
          fat_percentage: parseFloat(perc.fat_percentage),
          skeletal_mass_percentage: parseFloat(perc.skeletal_mass_percentage),
          muscle_dynamics: parseFloat(perc.muscle_dynamics),
          body_water: parseFloat(perc.body_water),
          protein: parseFloat(perc.protein),
          fat_content: parseFloat(perc.fat_content)
        };
      });

    res.json(result);
  } catch (error) {
    console.error('Ошибка при получении истории процентных замеров:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение совокупной активной подписки
app.get('/clients/:clientId/subscription', async (req, res) => {
  const { clientId } = req.params;

  try {
    const now = new Date();

    const activePayments = await Payments.findAll({
      where: {
        client_id: clientId,
        end_date: { [Op.gte]: now } // Все текущие и будущие
      },
      order: [['start_date', 'ASC']]
    });

    if (!activePayments.length) {
      return res.json(null);
    }

    const totalTraining = activePayments.reduce((acc, p) => acc + p.training_sessions, 0);
    const usedTraining = activePayments.reduce((acc, p) => acc + p.used_training_sessions, 0);

    res.json({
      tariff: activePayments[activePayments.length - 1].tariff, // последний оплаченный тариф
      start_date: activePayments[0].start_date,
      end_date: activePayments[activePayments.length - 1].end_date,
      training_sessions: totalTraining,
      used_training_sessions: usedTraining,
      active: true
    });

  } catch (error) {
    console.error('Ошибка при получении подписки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Оформление новой подписки
app.post('/payments', async (req, res) => {
  const {
    tariff, tariff_type, training_sessions,
    amount, start_date, end_date, client_id
  } = req.body;

  try {
    await Payments.create({
      client_id,
      payment_date: new Date(),
      tariff,                // 'basic' / 'standard' / 'premium'
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

// Получить всех клиентов, привязанных к тренеру
app.get('/coaches/:coachId/clients', async (req, res) => {
  const { coachId } = req.params;

  try {
    const coach = await Coaches.findByPk(coachId);
    if (!coach) {
      return res.status(404).json({ error: 'Тренер не найден' });
    }

    const clients = await Clients.findAll({
      where: { coach_id: coachId },
      attributes: ['clientid', 'first_name', 'last_name', 'email', 'phone_number', 'birth_date', 'gender', 'image']
    });

    res.json(clients);
  } catch (error) {
    console.error('Ошибка при получении клиентов тренера:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/clients/:id/add-full-measurement', async (req, res) => {
  const { id: clientId } = req.params;
  const { date, unit, kg, cm, percentage, weight_machine } = req.body;

  try {
    // Получение предыдущей записи прогресса
    const prevProgress = await Progress.findOne({
      where: { client_id: clientId },
      order: [['progressid', 'DESC']],
      include: [
        { model: UnitMeasurement, as: 'unitMeasurement' },
        { model: KgMeasurement, as: 'kilogramMeasurement' },
        { model: PercentageMeasurement, as: 'percentageMeasurement' }
      ]
    });

    // Создание всех замеров
    const unitResult = await UnitMeasurement.create({ ...unit, date });
    const kgResult = await KgMeasurement.create({ ...kg, date });
    const cmResult = await SmMeasurement.create({ ...cm, date });
    const percResult = await PercentageMeasurement.create({ ...percentage, date });
    const weightResult = await WeightsOnMachine.create({ ...weight_machine, date });

    // Генерация анализа
    let measurementAnalysis = "Общий анализ показателей стабильный.";
    let weightAnalysis = "Весовые характеристики без резких изменений.";
    let fullMeasurementAnalysis = "Показатели тела соответствуют норме.";
    let fullWeightAnalysis = "Поддерживается стабильный уровень физической формы.";

    if (prevProgress?.unitMeasurement && unitResult.bmi !== null) {
      const delta = unitResult.bmi - prevProgress.unitMeasurement.bmi;
      if (delta > 0.5) measurementAnalysis = "Наблюдается постепенное увеличение массы тела.";
      else if (delta < -0.5) measurementAnalysis = "Имеется тенденция к снижению массы тела.";
      else measurementAnalysis = "Индекс массы тела сохраняется на стабильном уровне.";
    }

    if (prevProgress?.kilogramMeasurement && kgResult.muscle_mass !== null) {
      const delta = kgResult.muscle_mass - prevProgress.kilogramMeasurement.muscle_mass;
      if (delta > 0.5) fullMeasurementAnalysis = "Отмечается рост мышечной массы.";
      else if (delta < -0.5) fullMeasurementAnalysis = "Фиксируется снижение мышечной массы.";
      else fullMeasurementAnalysis = "Мышечная масса остаётся в пределах нормы.";
    }

    if (prevProgress?.percentageMeasurement && percResult.fat_percentage !== null) {
      const delta = percResult.fat_percentage - prevProgress.percentageMeasurement.fat_percentage;
      if (delta > 0.5) weightAnalysis = "Отмечается повышение жирового показателя.";
      else if (delta < -0.5) weightAnalysis = "Прослеживается снижение процента жира.";
      else weightAnalysis = "Жировые показатели остаются без изменений.";
    }

    if (prevProgress?.kilogramMeasurement && kgResult.weight !== null) {
      const delta = kgResult.weight - prevProgress.kilogramMeasurement.weight;
      if (delta > 1) fullWeightAnalysis = "Наблюдается увеличение общей массы тела.";
      else if (delta < -1) fullWeightAnalysis = "Имеет место снижение общей массы тела.";
      else fullWeightAnalysis = "Масса тела остаётся устойчивой.";
    }

    // Создание строки прогресса
    const progress = await Progress.create({
      client_id: clientId,
      unit_measurement_id: unitResult.measurementid,
      kilogram_measurement_id: kgResult.kilogramid,
      centimetre_measurement_id: cmResult.centimetreid,
      percentage_measurement_id: percResult.percentageid,
      weight_id: weightResult.weightid,
      measurement_analysis: measurementAnalysis,
      weight_analysis: weightAnalysis,
      full_measurement_analysis: fullMeasurementAnalysis,
      full_weight_analysis: fullWeightAnalysis
    });

    res.status(201).json({ message: 'Все замеры и анализ успешно сохранены', progress_id: progress.progressid });
  } catch (error) {
    console.error('Ошибка при добавлении замеров и анализа:', error);
    res.status(500).json({ error: 'Ошибка сервера', detail: error.message });
  }
});

app.post('/send-feedback', async (req, res) => {
  const { rating, comment, clientEmail, clientName } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // или другой SMTP
      auth: {
        user: 'elfimov.maksim1415@gmail.com', // Твоя почта
        pass: 'rloi vcvb rnmh ylqz'     // Пароль приложения (создаётся в Google аккаунте)
      }
    });

    await transporter.sendMail({
      from: '"Training Territory" <elfimov.maksim1415@gmail.com>',
      to: 'elfimov.m@gs.donstu.ru',
      subject: 'Новый отзыв от клиента',
      text: `
Новый отзыв от клиента:

Имя: ${clientName}
Email: ${clientEmail}
Оценка: ${rating}
Комментарий:
${comment}
      `
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка при отправке письма:', err);
    res.status(500).json({ error: 'Ошибка сервера при отправке письма' });
  }
});

app.delete('/schedule/:scheduleId', async (req, res) => {
  const { scheduleId } = req.params;
  try {
    const deleted = await Schedule.destroy({ where: { scheduleid: scheduleId } });
    if (deleted) {
      res.json({ message: 'Тренировка отменена' });
    } else {
      res.status(404).json({ error: 'Тренировка не найдена' });
    }
  } catch (error) {
    console.error('Ошибка при удалении тренировки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить сообщения между двумя пользователями
app.get('/chat', (req, res) => {
  const { senderId, recipientId } = req.query;

  if (!senderId || !recipientId) {
    return res.status(400).json({ error: 'Необходимы senderId и recipientId' });
  }

  const sId = parseInt(senderId);
  const rId = parseInt(recipientId);

  const messages = chatMessages.filter(msg =>
    (msg.sender_id === sId && msg.recipient_id === rId) ||
    (msg.sender_id === rId && msg.recipient_id === sId)
  );

  res.json(messages);
});

// Отправить сообщение
app.post('/chat/send', (req, res) => {
  const { sender_id, recipient_id, text, timestamp } = req.body;

  if (!sender_id || !recipient_id || !text || !timestamp) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  const newMessage = { sender_id, recipient_id, text, timestamp };
  chatMessages.push(newMessage);

  res.json({ success: true, message: newMessage });
});
module.exports = app;