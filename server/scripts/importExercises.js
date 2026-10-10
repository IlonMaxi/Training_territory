/*
  Импорт справочника упражнений из free-exercise-db (Unlicense, общественное
  достояние) в таблицу exercises.

  Служебные поля переводятся полностью по словарям, названия — по таблице NAMES.
  Непереведённые попадают в базу с английским названием и помечены как
  непереведённые: их видно в админке, и перевод дописывается в
  server/data/exerciseTranslations.js без повторного скачивания.

  Скрипт идемпотентный: узнаёт свои записи по external_id, при повторном
  запуске обновляет их и не трогает упражнения, заведённые вручную.

  Запуск: npm run import:exercises
*/
require('dotenv').config();

const path = require('path');
const sequelize = require('../../config/database');
const { QueryTypes } = require('sequelize');

const dataset = require('../data/free-exercise-db.json');
const { MUSCLES, EQUIPMENT, LEVELS, NAMES } = require('../data/exerciseTranslations');

const SOURCE = 'free-exercise-db';

// Колонок под источник и группу мышц в таблице не было — добавляем.
// Все nullable, поэтому существующие 54 упражнения не затрагиваются.
const addColumns = async () => {
  const columns = [
    ['name_en', 'VARCHAR(255)'],
    ['muscle_group', 'VARCHAR(100)'],
    ['external_id', 'VARCHAR(255)'],
    ['source', 'VARCHAR(50)'],
    ['translated', 'BOOLEAN']
  ];

  for (const [name, type] of columns) {
    await sequelize.query(`ALTER TABLE exercises ADD COLUMN IF NOT EXISTS ${name} ${type}`);
  }

  await sequelize.query(
    'CREATE UNIQUE INDEX IF NOT EXISTS exercises_external_id_idx ON exercises (external_id) WHERE external_id IS NOT NULL'
  );
};

const buildRow = (item) => {
  const russian = NAMES[item.name];
  const muscle = (item.primaryMuscles || [])[0];

  return {
    external_id: item.id,
    name: russian || item.name,
    name_en: item.name,
    translated: Boolean(russian),
    muscle_group: MUSCLES[muscle] || null,
    machine: EQUIPMENT[item.equipment] || null,
    difficulty_level: LEVELS[item.level] || null
  };
};

(async () => {
  try {
    await addColumns();
    console.log('колонки справочника готовы');

    let created = 0;
    let updated = 0;

    for (const item of dataset) {
      const row = buildRow(item);

      const [existing] = await sequelize.query(
        'SELECT exerciseid, name, name_en FROM exercises WHERE external_id = :id',
        { replacements: { id: row.external_id }, type: QueryTypes.SELECT }
      );

      if (existing) {
        // Название могли перевести руками в админ-панели. Если оно отличается
        // от английского и в словаре перевода этой строки нет — это ручная
        // правка, её нельзя затирать при повторном импорте.
        const editedByHand = !NAMES[item.name] && existing.name !== existing.name_en;
        const finalName = editedByHand ? existing.name : row.name;

        await sequelize.query(
          `UPDATE exercises SET name = :name, name_en = :name_en, translated = :translated,
             muscle_group = :muscle_group, machine = :machine, difficulty_level = :difficulty_level
           WHERE exerciseid = :pk`,
          {
            replacements: {
              ...row,
              name: finalName,
              translated: row.translated || editedByHand,
              pk: existing.exerciseid
            }
          }
        );
        updated += 1;
      } else {
        await sequelize.query(
          `INSERT INTO exercises (name, name_en, translated, muscle_group, machine, difficulty_level, external_id, source)
           VALUES (:name, :name_en, :translated, :muscle_group, :machine, :difficulty_level, :external_id, :source)`,
          { replacements: { ...row, source: SOURCE } }
        );
        created += 1;
      }
    }

    const [stats] = await sequelize.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE source = :source)::int AS imported,
              COUNT(*) FILTER (WHERE translated)::int AS translated,
              COUNT(*) FILTER (WHERE source IS NULL)::int AS manual
       FROM exercises`,
      { replacements: { source: SOURCE }, type: QueryTypes.SELECT }
    );

    console.log(`добавлено: ${created}, обновлено: ${updated}`);
    console.log(`в справочнике: ${stats.total} (импорт ${stats.imported}, своих ${stats.manual})`);
    console.log(`с русским названием: ${stats.translated} из ${stats.imported}`);
    process.exit(0);
  } catch (error) {
    console.error('ошибка импорта:', error.message);
    process.exit(1);
  }
})();
