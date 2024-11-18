// models/PercentageMeasurement.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PercentageMeasurement = sequelize.define('PercentageMeasurement', {
  percentageid: { // Соответствует столбцу 'percentageid'
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fat_percentage: { // Соответствует столбцу 'fat_percentage'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true, // В SQL нет ограничения NOT NULL, поэтому allowNull: true
    validate: {
      min: 0, // Минимальное значение 0, если применимо
    },
  },
  skeletal_mass_percentage: { // Соответствует столбцу 'skeletal_mass_percentage'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  muscle_dynamics: { // Соответствует столбцу 'muscle_dynamics'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  body_water: { // Соответствует столбцу 'body_water'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  protein: { // Соответствует столбцу 'protein'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  fat_content: { // Соответствует столбцу 'fat_content'
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
  tableName: 'measurements_in_percentage', // Имя таблицы в нижнем регистре
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
PercentageMeasurement.associate = (models) => {
  // Пример: Связь с моделью Progress
  // PercentageMeasurement.hasMany(models.Progress, {
  //   foreignKey: 'percentage_measurement_id',
  //   as: 'progressRecords',
  // });
};

module.exports = PercentageMeasurement;
