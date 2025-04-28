const Clients = require('./Client');
const ClientSchedule = require('./ClientSchedule');
const Schedule = require('./Schedule');
const Coaches = require('./Coach');
const Workout = require('./Workout');
const WeightsOnMachine = require('./WeightsOnMachine');
const Progress = require('./Progress');
const UnitMeasurement = require('./UnitMeasurement');
const PercentageMeasurement = require('./PercentageMeasurement');
const KgMeasurement = require('./KgMeasurement');
const SmMeasurement = require('./SmMeasurement');

// === ClientSchedule ↔ Clients
Clients.hasMany(ClientSchedule, { foreignKey: 'client_id', as: 'clientSchedules' });
ClientSchedule.belongsTo(Clients, { foreignKey: 'client_id', as: 'client' });

// === ClientSchedule ↔ Schedule
Schedule.hasMany(ClientSchedule, { foreignKey: 'schedule_id', as: 'clientSchedules' });
ClientSchedule.belongsTo(Schedule, { foreignKey: 'schedule_id', as: 'schedule' });

// === Schedule → Coach
Schedule.belongsTo(Coaches, { foreignKey: 'coach_id', as: 'coach' });

// === Schedule → Workout
Schedule.belongsTo(Workout, { foreignKey: 'workout_id', as: 'workout' });

// === Progress → Clients
Progress.belongsTo(Clients, { foreignKey: 'client_id', as: 'client' });

// === Progress → Measurements (все 4 типа)
Progress.belongsTo(UnitMeasurement, { foreignKey: 'unit_measurement_id', as: 'unitMeasurement' });
Progress.belongsTo(PercentageMeasurement, { foreignKey: 'percentage_measurement_id', as: 'percentageMeasurement' });
Progress.belongsTo(KgMeasurement, { foreignKey: 'kilogram_measurement_id', as: 'kilogramMeasurement' });
Progress.belongsTo(SmMeasurement, { foreignKey: 'centimetre_measurement_id', as: 'centimetreMeasurement' });

// === Progress → Weight
Progress.belongsTo(WeightsOnMachine, { foreignKey: 'weight_id', as: 'weight' });

