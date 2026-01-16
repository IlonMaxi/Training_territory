const Progress = require('../../models/Progress');
const UnitMeasurement = require('../../models/UnitMeasurement');
const KgMeasurement = require('../../models/KgMeasurement');
const SmMeasurement = require('../../models/SmMeasurement');
const PercentageMeasurement = require('../../models/PercentageMeasurement');

const getProgressSummary = async (clientId) => {
  const [firstProgress, lastProgress] = await Promise.all([
    Progress.findOne({ where: { client_id: clientId }, order: [['progressid', 'ASC']] }),
    Progress.findOne({ where: { client_id: clientId }, order: [['progressid', 'DESC']] })
  ]);

  if (!firstProgress || !lastProgress) {
    return null;
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

  return {
    'Вес': percentOrZero(firstKg?.weight, lastKg?.weight),
    'Жировая масса': percentOrZero(firstKg?.fat_mass, lastKg?.fat_mass),
    'Мышечная масса': percentOrZero(firstKg?.muscle_mass, lastKg?.muscle_mass),
    'Содержание воды': percentOrZero(firstKg?.water_content, lastKg?.water_content),
    'Скелетная масса': percentOrZero(firstKg?.skeletal_mass, lastKg?.skeletal_mass),
    'Костная масса': percentOrZero(firstKg?.bone_mass, lastKg?.bone_mass),
    'Масса без жира': percentOrZero(firstKg?.lbm, lastKg?.lbm),

    'Индекс массы тела': percentOrZero(firstUnit?.bmi, lastUnit?.bmi),
    'Метаболизм': percentOrZero(firstUnit?.metabolism, lastUnit?.metabolism),
    'Возраст тела': percentOrZero(firstUnit?.body_age, lastUnit?.body_age),

    'Процент жира': percentOrZero(firstPerc?.fat_percentage, lastPerc?.fat_percentage),
    'Процент скелетных мышц': percentOrZero(firstPerc?.skeletal_mass_percentage, lastPerc?.skeletal_mass_percentage),
    'Динамика мышц': percentOrZero(firstPerc?.muscle_dynamics, lastPerc?.muscle_dynamics),
    'Вода в организме': percentOrZero(firstPerc?.body_water, lastPerc?.body_water),
    'Белок': percentOrZero(firstPerc?.protein, lastPerc?.protein),
    'Жировое содержание': percentOrZero(firstPerc?.fat_content, lastPerc?.fat_content),

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

    'Анализ замеров': lastProgress.measurement_analysis || '',
    'Анализ веса': lastProgress.weight_analysis || '',
    'Полный анализ замеров': lastProgress.full_measurement_analysis || '',
    'Полный анализ веса': lastProgress.full_weight_analysis || ''
  };
};

module.exports = { getProgressSummary };
