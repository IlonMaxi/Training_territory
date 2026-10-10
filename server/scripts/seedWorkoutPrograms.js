/*
  Создаёт таблицу workout_exercises и наполняет базу программами-шаблонами,
  которые показывает помощник. Раньше эти программы лежали захардкоженными
  в компоненте чата — теперь их правит тренер через админ-панель.

  Скрипт идемпотентный: повторный запуск ничего не дублирует и не удаляет.
  Запуск: npm run seed:workouts
*/
require('dotenv').config();

const sequelize = require('../../config/database');
const Exercise = require('../../models/Exercise');
const Workout = require('../../models/Workout');
const WorkoutExercise = require('../../models/WorkoutExercise');
require('../../models/associations');

// Программы-шаблоны: coach_id = NULL, то есть не принадлежат тренеру.
// description содержит синонимы («руки», «широчайшие») — по нему помощник
// находит программу, поэтому список слов правится в админке, а не в коде.
const PROGRAMS = [
  {
    name: 'Силовая, всё тело',
    description: 'Базовая силовая тренировка на всё тело. Общая, фулбоди, для новичка.',
    workout_type: 'силовая',
    difficulty: 'Средний',
    duration: '55 minutes',
    exercises: [
      { name: 'Приседания со штангой', machine: 'Штанга', sets: 4, reps: '8–10' },
      { name: 'Жим штанги лёжа', machine: 'Штанга', sets: 4, reps: '8–10' },
      { name: 'Тяга штанги в наклоне', machine: 'Штанга', sets: 4, reps: '10–12' },
      { name: 'Жим гантелей стоя', machine: 'Гантели', sets: 3, reps: '10–12' },
      { name: 'Планка', machine: 'Без оборудования', sets: 3, reps: '45 секунд' }
    ]
  },
  {
    name: 'Спина',
    description: 'Тренировка на спину. Широчайшие, поясница, трапеции.',
    workout_type: 'силовая',
    difficulty: 'Средний',
    duration: '45 minutes',
    exercises: [
      { name: 'Подтягивания', machine: 'Турник', sets: 4, reps: '8–12' },
      { name: 'Тяга штанги в наклоне', machine: 'Штанга', sets: 4, reps: '10–12' },
      { name: 'Тяга горизонтального блока', machine: 'Тренажер для спины', sets: 3, reps: '12' },
      { name: 'Гиперэкстензия', machine: 'Тренажер для спины', sets: 3, reps: '15' },
      { name: 'Шраги с гантелями', machine: 'Гантели', sets: 3, reps: '15' }
    ]
  },
  {
    name: 'Бицепс',
    description: 'Тренировка на бицепс и мышцы рук.',
    workout_type: 'силовая',
    difficulty: 'Низкий',
    duration: '35 minutes',
    exercises: [
      { name: 'Подъём штанги на бицепс', machine: 'Штанга', sets: 4, reps: '10–12' },
      { name: 'Подъём гантелей с супинацией', machine: 'Гантели', sets: 3, reps: '12' },
      { name: 'Молотки', machine: 'Гантели', sets: 3, reps: '12–15' },
      { name: 'Подъём на скамье Скотта', machine: 'Скамья Скотта', sets: 3, reps: '12' }
    ]
  },
  {
    name: 'Грудь',
    description: 'Тренировка на грудные мышцы.',
    workout_type: 'силовая',
    difficulty: 'Средний',
    duration: '45 minutes',
    exercises: [
      { name: 'Жим штанги лёжа', machine: 'Штанга', sets: 4, reps: '8–10' },
      { name: 'Жим гантелей на наклонной скамье', machine: 'Гантели', sets: 4, reps: '10–12' },
      { name: 'Разведение гантелей лёжа', machine: 'Гантели', sets: 3, reps: '12–15' },
      { name: 'Отжимания на брусьях', machine: 'Брусья', sets: 3, reps: 'до отказа' }
    ]
  },
  {
    name: 'Ноги',
    description: 'Тренировка на ноги: квадрицепсы, бёдра, ягодицы, икры.',
    workout_type: 'силовая',
    difficulty: 'Высокий',
    duration: '50 minutes',
    exercises: [
      { name: 'Приседания со штангой', machine: 'Штанга', sets: 4, reps: '8–10' },
      { name: 'Жим ногами', machine: 'Тренажер для ног', sets: 4, reps: '12' },
      { name: 'Румынская тяга', machine: 'Штанга', sets: 3, reps: '10–12' },
      { name: 'Выпады с гантелями', machine: 'Гантели', sets: 3, reps: '12 на ногу' },
      { name: 'Подъёмы на носки', machine: 'Тренажер для голени', sets: 4, reps: '15–20' }
    ]
  },
  {
    name: 'Плечи',
    description: 'Тренировка на плечи и дельты, передний и средний пучок.',
    workout_type: 'силовая',
    difficulty: 'Средний',
    duration: '40 minutes',
    exercises: [
      { name: 'Жим гантелей сидя', machine: 'Гантели', sets: 4, reps: '10–12' },
      { name: 'Махи гантелями в стороны', machine: 'Гантели', sets: 4, reps: '12–15' },
      { name: 'Махи в наклоне на заднюю дельту', machine: 'Гантели', sets: 3, reps: '15' },
      { name: 'Тяга штанги к подбородку', machine: 'Штанга', sets: 3, reps: '12' }
    ]
  },
  {
    name: 'Пресс и кор',
    description: 'Тренировка на пресс, кор и мышцы живота.',
    workout_type: 'функциональная',
    difficulty: 'Низкий',
    duration: '25 minutes',
    exercises: [
      { name: 'Скручивания', machine: 'Без оборудования', sets: 3, reps: '20' },
      { name: 'Подъём ног в висе', machine: 'Турник', sets: 3, reps: '12–15' },
      { name: 'Планка', machine: 'Без оборудования', sets: 3, reps: '60 секунд' },
      { name: 'Боковая планка', machine: 'Без оборудования', sets: 3, reps: '40 секунд на сторону' },
      { name: 'Велосипед лёжа', machine: 'Без оборудования', sets: 3, reps: '20 на сторону' }
    ]
  },
  {
    name: 'Трицепс',
    description: 'Тренировка на трицепс, задняя поверхность рук.',
    workout_type: 'силовая',
    difficulty: 'Низкий',
    duration: '30 minutes',
    exercises: [
      { name: 'Французский жим', machine: 'Штанга', sets: 4, reps: '10–12' },
      { name: 'Разгибание рук на блоке', machine: 'Блочный тренажер', sets: 3, reps: '12–15' },
      { name: 'Отжимания узким хватом', machine: 'Без оборудования', sets: 3, reps: 'до отказа' },
      { name: 'Разгибание руки в наклоне', machine: 'Гантели', sets: 3, reps: '12 на руку' }
    ]
  },
  {
    name: 'Ягодицы и бёдра',
    description: 'Тренировка на ягодицы, заднюю поверхность бедра и голеностоп.',
    workout_type: 'силовая',
    difficulty: 'Средний',
    duration: '45 minutes',
    exercises: [
      { name: 'Ягодичный мост со штангой', machine: 'Штанга', sets: 4, reps: '12' },
      { name: 'Румынская тяга', machine: 'Штанга', sets: 4, reps: '10–12' },
      { name: 'Отведение ноги на блоке', machine: 'Блочный тренажер', sets: 3, reps: '15 на ногу' },
      { name: 'Болгарские выпады', machine: 'Гантели', sets: 3, reps: '12 на ногу' },
      { name: 'Подъёмы на носки стоя', machine: 'Тренажер для голени', sets: 4, reps: '20' }
    ]
  },
  {
    name: 'Круговая функциональная',
    description: 'Круговая функциональная тренировка на всё тело, выносливость и жиросжигание.',
    workout_type: 'функциональная',
    difficulty: 'Высокий',
    duration: '40 minutes',
    exercises: [
      { name: 'Бёрпи', machine: 'Без оборудования', sets: 4, reps: '12' },
      { name: 'Махи гирей', machine: 'Гиря', sets: 4, reps: '15' },
      { name: 'Прыжки на тумбу', machine: 'Плиометрический бокс', sets: 4, reps: '12' },
      { name: 'Гребной тренажёр', machine: 'Гребной тренажер', sets: 4, reps: '250 метров' },
      { name: 'Планка с касанием плеч', machine: 'Без оборудования', sets: 3, reps: '20 касаний' }
    ]
  },
  {
    name: 'Растяжка и восстановление',
    description: 'Растяжка, заминка, восстановление и подвижность суставов.',
    workout_type: 'функциональная',
    difficulty: 'Низкий',
    duration: '25 minutes',
    exercises: [
      { name: 'Растяжка задней поверхности бедра', machine: 'Без оборудования', sets: 2, reps: '60 секунд' },
      { name: 'Растяжка грудного отдела на валике', machine: 'Массажный ролик', sets: 2, reps: '60 секунд' },
      { name: 'Раскатка квадрицепса на ролике', machine: 'Массажный ролик', sets: 2, reps: '60 секунд' },
      { name: 'Подвижность голеностопа у стены', machine: 'Без оборудования', sets: 2, reps: '15 на ногу' },
      { name: 'Поза ребёнка', machine: 'Без оборудования', sets: 2, reps: '60 секунд' }
    ]
  },
  {
    name: 'Кардио',
    description: 'Кардио тренировка на выносливость, бег и жиросжигание.',
    workout_type: 'кардио',
    difficulty: 'Низкий',
    duration: '35 minutes',
    exercises: [
      { name: 'Разминка на дорожке', machine: 'Беговая дорожка', sets: 1, reps: '5 минут' },
      { name: 'Интервальный бег', machine: 'Беговая дорожка', sets: 8, reps: '1 мин быстро / 2 мин спокойно' },
      { name: 'Велотренажёр, ровный темп', machine: 'Велотренажер', sets: 1, reps: '10 минут' },
      { name: 'Заминка и растяжка', machine: 'Без оборудования', sets: 1, reps: '5 минут' }
    ]
  }
];

const createTable = async () => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS workout_exercises (
      workoutexerciseid SERIAL PRIMARY KEY,
      workout_id INTEGER NOT NULL REFERENCES workouts(workoutid) ON DELETE CASCADE,
      exercise_id INTEGER NOT NULL REFERENCES exercises(exerciseid) ON DELETE CASCADE,
      position INTEGER NOT NULL DEFAULT 1,
      sets INTEGER,
      reps VARCHAR(50)
    )
  `);
  await sequelize.query(
    'CREATE INDEX IF NOT EXISTS workout_exercises_workout_id_idx ON workout_exercises (workout_id)'
  );
};

// Упражнения переиспользуем по имени: «Жим штанги лёжа» есть и в силовой,
// и в тренировке на грудь — второй раз заводить его не нужно
const findOrCreateExercise = async (item) => {
  const existing = await Exercise.findOne({ where: { name: item.name } });
  if (existing) return existing;

  return Exercise.create({
    name: item.name,
    description: null,
    difficulty_level: 'Средний',
    machine: item.machine
  });
};

const seedProgram = async (program) => {
  const existing = await Workout.findOne({
    where: { name: program.name, coach_id: null }
  });

  if (existing) {
    const count = await WorkoutExercise.count({ where: { workout_id: existing.workoutid } });
    return { name: program.name, status: `уже есть (${count} упражнений)` };
  }

  const workout = await Workout.create({
    name: program.name,
    description: program.description,
    difficulty: program.difficulty,
    duration: program.duration,
    workout_type: program.workout_type,
    max_participants: 1,
    coach_id: null,
    exercise_id: null
  });

  let position = 1;
  for (const item of program.exercises) {
    const exercise = await findOrCreateExercise(item);
    await WorkoutExercise.create({
      workout_id: workout.workoutid,
      exercise_id: exercise.exerciseid,
      position,
      sets: item.sets,
      reps: item.reps
    });
    position += 1;
  }

  return { name: program.name, status: `создана, id=${workout.workoutid}, упражнений ${program.exercises.length}` };
};

(async () => {
  try {
    await createTable();
    console.log('таблица workout_exercises готова');

    for (const program of PROGRAMS) {
      const result = await seedProgram(program);
      console.log(`  ${result.name.padEnd(20)} ${result.status}`);
    }

    console.log('\nготово');
    process.exit(0);
  } catch (error) {
    console.error('ошибка наполнения:', error.message);
    process.exit(1);
  }
})();
