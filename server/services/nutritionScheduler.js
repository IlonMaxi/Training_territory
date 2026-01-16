const cron = require('node-cron');

const Clients = require('../../models/Client');
const ClientSchedule = require('../../models/ClientSchedule');
const Nutrition = require('../../models/Nutrition');
const Recipe = require('../../models/Recipe');
const Schedule = require('../../models/Schedule');
const Workout = require('../../models/Workout');

const MEALS = [
  { name: 'Завтрак', ratio: 0.25 },
  { name: 'Обед', ratio: 0.375 },
  { name: 'Ужин', ratio: 0.375 }
];

const getBaseCalories = (gender) => {
  return gender === 'female' ? 1800 : 2200;
};

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

const generateNutritionSchedule = async () => {
  console.log('?? Запуск генерации питания...');
  try {
    const clients = await Clients.findAll();
    const allRecipes = await Recipe.findAll();

    if (!clients.length || !allRecipes.length) {
      console.log('? Нет клиентов или рецептов.');
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
            // console.log(`?? Обновлено (${meal.name}) для клиента ${clientId} на ${dateOnly.toDateString()}`);
          } else {
            await Nutrition.create(mealData);
            // console.log(`? Добавлено (${meal.name}) для клиента ${clientId} на ${dateOnly.toDateString()}`);
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  } catch (error) {
    console.error('? Ошибка генерации питания:', error);
  }
};

const startNutritionScheduler = () => {
  (async () => {
    console.log('Первый запуск: генерация расписания...');
    await generateNutritionSchedule();
  })();

  cron.schedule('0 0 * * *', async () => {
    console.log('Запуск плановой генерации питания...');
    await generateNutritionSchedule();
  });
};

module.exports = { startNutritionScheduler };
