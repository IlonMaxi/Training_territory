const Progress = require('../../models/Progress');
const UnitMeasurement = require('../../models/UnitMeasurement');
const KgMeasurement = require('../../models/KgMeasurement');
const SmMeasurement = require('../../models/SmMeasurement');
const PercentageMeasurement = require('../../models/PercentageMeasurement');
const WeightsOnMachine = require('../../models/WeightsOnMachine');

const addFullMeasurement = async (clientId, payload) => {
  const { date, unit, kg, cm, percentage, weight_machine } = payload;

  const prevProgress = await Progress.findOne({
    where: { client_id: clientId },
    order: [['progressid', 'DESC']],
    include: [
      { model: UnitMeasurement, as: 'unitMeasurement' },
      { model: KgMeasurement, as: 'kilogramMeasurement' },
      { model: PercentageMeasurement, as: 'percentageMeasurement' }
    ]
  });

  const unitResult = await UnitMeasurement.create({ ...unit, date });
  const kgResult = await KgMeasurement.create({ ...kg, date });
  const cmResult = await SmMeasurement.create({ ...cm, date });
  const percResult = await PercentageMeasurement.create({ ...percentage, date });
  const weightResult = await WeightsOnMachine.create({ ...weight_machine, date });

  let measurementAnalysis = 'Общий анализ показателей стабильный.';
  let weightAnalysis = 'Весовые характеристики без резких изменений.';
  let fullMeasurementAnalysis = 'Показатели тела соответствуют норме.';
  let fullWeightAnalysis = 'Поддерживается стабильный уровень физической формы.';

  if (prevProgress?.unitMeasurement && unitResult.bmi !== null) {
    const delta = unitResult.bmi - prevProgress.unitMeasurement.bmi;
    if (delta > 0.5) measurementAnalysis = 'Наблюдается постепенное увеличение массы тела.';
    else if (delta < -0.5) measurementAnalysis = 'Имеется тенденция к снижению массы тела.';
    else measurementAnalysis = 'Индекс массы тела сохраняется на стабильном уровне.';
  }

  if (prevProgress?.kilogramMeasurement && kgResult.muscle_mass !== null) {
    const delta = kgResult.muscle_mass - prevProgress.kilogramMeasurement.muscle_mass;
    if (delta > 0.5) fullMeasurementAnalysis = 'Отмечается рост мышечной массы.';
    else if (delta < -0.5) fullMeasurementAnalysis = 'Фиксируется снижение мышечной массы.';
    else fullMeasurementAnalysis = 'Мышечная масса остаётся в пределах нормы.';
  }

  if (prevProgress?.percentageMeasurement && percResult.fat_percentage !== null) {
    const delta = percResult.fat_percentage - prevProgress.percentageMeasurement.fat_percentage;
    if (delta > 0.5) weightAnalysis = 'Отмечается повышение жирового показателя.';
    else if (delta < -0.5) weightAnalysis = 'Прослеживается снижение процента жира.';
    else weightAnalysis = 'Жировые показатели остаются без изменений.';
  }

  if (prevProgress?.kilogramMeasurement && kgResult.weight !== null) {
    const delta = kgResult.weight - prevProgress.kilogramMeasurement.weight;
    if (delta > 1) fullWeightAnalysis = 'Наблюдается увеличение общей массы тела.';
    else if (delta < -1) fullWeightAnalysis = 'Имеет место снижение общей массы тела.';
    else fullWeightAnalysis = 'Масса тела остаётся устойчивой.';
  }

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

  return progress;
};

module.exports = { addFullMeasurement };
