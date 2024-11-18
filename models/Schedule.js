// models/Schedule.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  scheduleid: { // Соответствует столбцу 'scheduleid'
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  date: { // Соответствует столбцу 'date'
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
    },
  },
  start_time: { // Соответствует столбцу 'start_time'
    type: DataTypes.TIME,
    allowNull: false,
    validate: {
      is: /^([0-1]\d|2[0-3]):([0-5]\d)$/
    },
  },
  location: { // Соответствует столбцу 'location'
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      len: [0, 255], // Максимальная длина 255 символов
    },
  },
  end_time: { // Соответствует столбцу 'end_time'
    type: DataTypes.TIME,
    allowNull: true,
    validate: {
      is: /^([0-1]\d|2[0-3]):([0-5]\d)$/
    },
  },
  workout_id: { // Соответствует столбцу 'workout_id'
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'workouts', // Имя таблицы в нижнем регистре
      key: 'workoutid',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE', // Или 'SET NULL', в зависимости от вашей бизнес-логики
  },
  coach_id: { // Соответствует столбцу 'coach_id'
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'coaches', // Имя таблицы в нижнем регистре
      key: 'coachid',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE', // Или 'SET NULL', в зависимости от вашей бизнес-логики
  },
}, {
  tableName: 'schedule', // Имя таблицы в нижнем регистре
  timestamps: false,      // Отключаем автоматическое добавление полей createdAt и updatedAt
  indexes: [
    {
      unique: false,
      fields: ['date'],
    },
    {
      unique: false,
      fields: ['workout_id'],
    },
    {
      unique: false,
      fields: ['coach_id'],
    },
    // Добавьте другие индексы по необходимости
  ],
});

// Ассоциации
Schedule.associate = (models) => {
  // Связь с моделью Workout
  Schedule.belongsTo(models.Workout, {
    foreignKey: 'workout_id',
    as: 'workout',
  });

  // Связь с моделью Coach
  Schedule.belongsTo(models.Coach, {
    foreignKey: 'coach_id',
    as: 'coach',
  });

  // Если есть ассоциации с другими моделями, добавьте их здесь
};

module.exports = Schedule;
