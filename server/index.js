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
const ClientSchedule = require('../models/ClientSchedule');
const Recipe = require('../models/Recipe');

const app = express();
const { Op } = require('sequelize');

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

    const client = await Client.findByPk(userId);

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
  const { username, password } = req.body;
  try {
    const coach = await Coach.findOne({
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

    res.status(200).json({ message: 'Login successful', user: coach });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/coaches', async (req, res) => {
  const { last_name, first_name, patronymic, username, password, phone_number, email, birth_date, gender } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newCoach = await Coach.create({
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
  const { username, password } = req.body;
  try {
    const client = await Client.findOne({
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

    const newUser = await Client.create({
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
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Обновление данных клиента
// Обновление данных клиента
app.put('/clients/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, patronymic, username, phone_number, email } = req.body;

  try {
      const client = await Client.findByPk(id);
      if (!client) {
          return res.status(404).json({ error: 'Клиент не найден' });
      }

      await client.update({
          first_name,
          last_name,
          patronymic,
          username,
          phone_number,
          email
      });

      res.status(200).json({ message: 'Данные обновлены', user: client });
  } catch (error) {
      console.error('Ошибка обновления данных:', error);
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
        f.description AS food_description,
        f.protein_amount AS proteins, 
        f.fat_amount AS fats, 
        f.carbohydrate_amount AS carbohydrates,
        f.calories AS calories,
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

const getTotalCalories = (workoutType, difficulty) => {
  if (workoutType === 'силовая') {
    return difficulty === 'Высокий' ? 3200 : 2500;
  } else if (workoutType === 'кардио') {
    return difficulty === 'Высокий' ? 2800 : 2200;
  }
  return 2000;
};

const generateNutritionSchedule = async () => {
  console.log('Запуск задачи по генерации расписания...');
  try {
    const clients = await Client.findAll();
    if (!clients.length) return console.log('Нет клиентов для обработки.');

    for (const client of clients) {
      const clientId = client.clientid;
      const workouts = await Workout.findAll({ where: { coach_id: client.coach_id } });
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      console.log(`Генерация питания для клиента ${clientId} с ${currentDate.toDateString()}`);
      
      for (let i = 0; i < 7; i++) {
        const workout = workouts.find(w => new Date(w.date).toDateString() === currentDate.toDateString());
        const totalCalories = getTotalCalories(workout?.workout_type, workout?.difficulty);

        const existingNutritions = await Nutrition.findAll({
          where: { client_id: clientId, date: currentDate }
        });

        if (existingNutritions.length && workout === undefined) {
          console.log(`Питание для ${currentDate.toDateString()} уже существует и нет новых тренировок. Пропускаем.`);
        } else {
          const recipes = await Recipe.findAll();
          if (!recipes.length) {
            console.error('Нет доступных рецептов.');
            continue;
          }
          
          for (const meal of MEALS) {
            const mealCalories = Math.round(totalCalories * meal.ratio);
            const existingMeal = existingNutritions.find(n => n.meal_type === meal.name);
            const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];

            if (existingMeal) {
              await existingMeal.update({
                name: randomRecipe.name,
                description: randomRecipe.instructions,
                protein_amount: (mealCalories * 0.3) / 4,
                fat_amount: (mealCalories * 0.25) / 9,
                carbohydrate_amount: (mealCalories * 0.45) / 4,
                calories: mealCalories,
                water_amount: Math.random() * 500 + 1500,
                recipe_id: randomRecipe.recipeid,
              });
              console.log(`Обновлено питание (${meal.name}) для клиента ${clientId} на ${currentDate.toDateString()}`);
            } else {
              await Nutrition.create({
                client_id: clientId,
                date: currentDate,
                meal_type: meal.name,
                name: randomRecipe.name,
                description: randomRecipe.instructions,
                protein_amount: (mealCalories * 0.3) / 4,
                fat_amount: (mealCalories * 0.25) / 9,
                carbohydrate_amount: (mealCalories * 0.45) / 4,
                calories: mealCalories,
                water_amount: Math.random() * 500 + 1500,
                recipe_id: randomRecipe.recipeid,
              });
              console.log(`Добавлено питание (${meal.name}) для клиента ${clientId} на ${currentDate.toDateString()}`);
            }
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  } catch (error) {
    console.error('Ошибка при генерации питания:', error);
  }
};

(async () => {
  console.log('Первый запуск: генерация расписания...');
  await generateNutritionSchedule();
})();

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
      user = await Coach.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        username,
        phoneNumber,
        birthDate 
      });
    } else {
      user = await Client.create({
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

// Маршрут для получения клиентов тренера
app.get('/coaches/:coachId/clients', async (req, res) => {
  const { coachId } = req.params;

  try {
    // Проверка существования тренера
    const coach = await Coach.findByPk(coachId);
    if (!coach) {
      return res.status(404).json({ error: 'Тренер не найден' });
    }

    // Получение клиентов, связанных с тренером
    const clients = await Client.findAll({
      where: { coach_id: coachId },
      attributes: ['clientid', 'first_name', 'last_name'] // Выбираем только необходимые поля
    });

    res.json(clients);
  } catch (error) {
    console.error('Ошибка при получении клиентов:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Маршрут для получения тренировок тренера
app.get('/coaches/:coachId/workouts', async (req, res) => {
  const { coachId } = req.params;

  try {
    // Проверка существования тренера
    const coach = await Coach.findByPk(coachId);
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
    const coach = await Coach.findByPk(coachId, { transaction });
    if (!coach) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Тренер не найден.' });
    }

    // Проверка существования клиента и принадлежности тренеру
    const client = await Client.findOne({ where: { clientid: client_id, coach_id: coachId }, transaction });
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

module.exports = app;