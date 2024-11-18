// models/SmMeasurement.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SmMeasurement = sequelize.define('SmMeasurement', {
  centimetreid: { // Соответствует столбцу 'centimetreid'
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  chest_circumference: { // Соответствует столбцу 'chest_circumference'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0, // Минимальное значение 0
    },
  },
  waist_circumference: { // Соответствует столбцу 'waist_circumference'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  hip_circumference: { // Соответствует столбцу 'hip_circumference'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  bicep_circumference: { // Соответствует столбцу 'bicep_circumference'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  forearm_circumference: { // Соответствует столбцу 'forearm_circumference'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  quadriceps_circumference: { // Соответствует столбцу 'quadriceps_circumference'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  calf_circumference: { // Соответствует столбцу 'calf_circumference'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  thigh_circumference: { // Соответствует столбцу 'thigh_circumference'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  neck_circumference: { // Соответствует столбцу 'neck_circumference'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  waist_inhale_circumference: { // Соответствует столбцу 'waist_inhale_circumference'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  date: { // Соответствует столбцу 'date'
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true,
    },
  },
}, {
  tableName: 'measurements_in_centimeters', // Имя таблицы в нижнем регистре
  timestamps: false, // Отключаем автоматическое добавление полей createdAt и updatedAt
  indexes: [
    {
      unique: false,
      fields: ['date'], // Добавляем индекс на поле 'date', если часто используется в запросах
    },
    // Добавьте другие индексы по необходимости
  ],
});

// Если у вас есть связанные модели, вы можете добавить ассоциации здесь
SmMeasurement.associate = (models) => {
  // Пример: Связь с моделью Progress
  // SmMeasurement.hasMany(models.Progress, {
  //   foreignKey: 'centimetre_measurement_id',
  //   as: 'progressRecords',
  // });
};

module.exports = SmMeasurement;
