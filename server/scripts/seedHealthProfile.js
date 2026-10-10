/*
  Создаёт таблицы профиля здоровья и наполняет правила безопасности:
  какая травма какие группы мышц закрывает.

  Заодно проставляет группу мышц упражнениям, заведённым вручную, — без неё
  фильтр по травмам не сможет понять, что «Приседания со штангой» грузят ноги.

  Скрипт идемпотентный. Запуск: npm run seed:health
*/
require('dotenv').config();

const sequelize = require('../../config/database');
const { QueryTypes } = require('sequelize');

// Область тела -> группы мышц, которые при этой травме нагружать нельзя.
// Названия групп совпадают со справочником упражнений.
const RULES = {
  'колено': ['Квадрицепс', 'Задняя поверхность бедра', 'Икры', 'Ягодицы'],
  'голеностоп': ['Икры', 'Квадрицепс'],
  'стопа': ['Икры', 'Квадрицепс'],
  'нога': ['Квадрицепс', 'Задняя поверхность бедра', 'Икры', 'Ягодицы',
    'Приводящие мышцы бедра', 'Отводящие мышцы бедра'],
  'бедро': ['Квадрицепс', 'Задняя поверхность бедра', 'Приводящие мышцы бедра',
    'Отводящие мышцы бедра'],
  'таз': ['Ягодицы', 'Приводящие мышцы бедра', 'Отводящие мышцы бедра',
    'Задняя поверхность бедра'],
  'поясница': ['Поясница', 'Задняя поверхность бедра', 'Ягодицы'],
  'спина': ['Поясница', 'Середина спины', 'Широчайшие', 'Трапеции'],
  'шея': ['Шея', 'Трапеции', 'Плечи'],
  'плечо': ['Плечи', 'Грудь', 'Трапеции'],
  'ключица': ['Плечи', 'Грудь'],
  'локоть': ['Бицепс', 'Трицепс', 'Предплечья'],
  'запястье': ['Предплечья', 'Бицепс', 'Трицепс'],
  'кисть': ['Предплечья', 'Бицепс', 'Трицепс'],
  'рука': ['Бицепс', 'Трицепс', 'Предплечья', 'Плечи'],
  'грудь': ['Грудь', 'Плечи', 'Трицепс'],
  'пресс': ['Пресс', 'Поясница']
};

// Группы мышц для упражнений, заведённых вручную в seedWorkoutPrograms.
// У импортированных из free-exercise-db они проставлены при импорте.
const MANUAL_MUSCLES = {
  'Приседания со штангой': 'Квадрицепс',
  'Жим штанги лёжа': 'Грудь',
  'Тяга штанги в наклоне': 'Середина спины',
  'Жим гантелей стоя': 'Плечи',
  'Планка': 'Пресс',
  'Подтягивания': 'Широчайшие',
  'Тяга горизонтального блока': 'Середина спины',
  'Гиперэкстензия': 'Поясница',
  'Шраги с гантелями': 'Трапеции',
  'Подъём штанги на бицепс': 'Бицепс',
  'Подъём гантелей с супинацией': 'Бицепс',
  'Молотки': 'Бицепс',
  'Подъём на скамье Скотта': 'Бицепс',
  'Жим гантелей на наклонной скамье': 'Грудь',
  'Разведение гантелей лёжа': 'Грудь',
  'Отжимания на брусьях': 'Грудь',
  'Жим ногами': 'Квадрицепс',
  'Румынская тяга': 'Задняя поверхность бедра',
  'Выпады с гантелями': 'Квадрицепс',
  'Подъёмы на носки': 'Икры',
  'Разминка на дорожке': null,
  'Интервальный бег': null,
  'Велотренажёр, ровный темп': null,
  'Заминка и растяжка': null,
  'Жим гантелей сидя': 'Плечи',
  'Махи гантелями в стороны': 'Плечи',
  'Махи в наклоне на заднюю дельту': 'Плечи',
  'Тяга штанги к подбородку': 'Плечи',
  'Скручивания': 'Пресс',
  'Подъём ног в висе': 'Пресс',
  'Боковая планка': 'Пресс',
  'Велосипед лёжа': 'Пресс',
  'Французский жим': 'Трицепс',
  'Разгибание рук на блоке': 'Трицепс',
  'Отжимания узким хватом': 'Трицепс',
  'Разгибание руки в наклоне': 'Трицепс',
  'Ягодичный мост со штангой': 'Ягодицы',
  'Отведение ноги на блоке': 'Ягодицы',
  'Болгарские выпады': 'Квадрицепс',
  'Подъёмы на носки стоя': 'Икры',
  'Бёрпи': null,
  'Махи гирей': 'Ягодицы',
  'Прыжки на тумбу': 'Квадрицепс',
  'Гребной тренажёр': null,
  'Планка с касанием плеч': 'Пресс',
  'Растяжка задней поверхности бедра': null,
  'Растяжка грудного отдела на валике': null,
  'Раскатка квадрицепса на ролике': null,
  'Подвижность голеностопа у стены': null,
  'Поза ребёнка': null
};

const createTables = async () => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS client_limitations (
      limitationid SERIAL PRIMARY KEY,
      client_id INTEGER NOT NULL REFERENCES clients(clientid) ON DELETE CASCADE,
      kind VARCHAR(20) NOT NULL,
      value VARCHAR(100) NOT NULL,
      note TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE
    )
  `);
  await sequelize.query(
    'CREATE INDEX IF NOT EXISTS client_limitations_client_idx ON client_limitations (client_id)'
  );

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS limitation_rules (
      ruleid SERIAL PRIMARY KEY,
      area VARCHAR(100) NOT NULL,
      muscle_group VARCHAR(100) NOT NULL
    )
  `);
  await sequelize.query(
    'CREATE UNIQUE INDEX IF NOT EXISTS limitation_rules_pair_idx ON limitation_rules (area, muscle_group)'
  );
};

(async () => {
  try {
    await createTables();
    console.log('таблицы профиля здоровья готовы');

    let rules = 0;
    for (const [area, groups] of Object.entries(RULES)) {
      for (const group of groups) {
        const [inserted] = await sequelize.query(
          `INSERT INTO limitation_rules (area, muscle_group) VALUES (:area, :group)
           ON CONFLICT (area, muscle_group) DO NOTHING RETURNING ruleid`,
          { replacements: { area, group }, type: QueryTypes.SELECT }
        );
        if (inserted) rules += 1;
      }
    }
    console.log(`правил безопасности добавлено: ${rules} (областей тела: ${Object.keys(RULES).length})`);

    let filled = 0;
    for (const [name, group] of Object.entries(MANUAL_MUSCLES)) {
      if (!group) continue;
      const [result] = await sequelize.query(
        `UPDATE exercises SET muscle_group = :group
         WHERE name = :name AND (muscle_group IS NULL OR muscle_group = '')
         RETURNING exerciseid`,
        { replacements: { name, group }, type: QueryTypes.SELECT }
      );
      if (result) filled += 1;
    }
    console.log(`группа мышц проставлена упражнениям: ${filled}`);

    const [left] = await sequelize.query(
      `SELECT COUNT(*)::int AS n FROM exercises e
       WHERE e.muscle_group IS NULL
         AND EXISTS (SELECT 1 FROM workout_exercises we WHERE we.exercise_id = e.exerciseid)`,
      { type: QueryTypes.SELECT }
    );
    console.log(`упражнений в программах без группы мышц: ${left.n} (кардио и растяжка — это нормально)`);

    process.exit(0);
  } catch (error) {
    console.error('ошибка:', error.message);
    process.exit(1);
  }
})();
