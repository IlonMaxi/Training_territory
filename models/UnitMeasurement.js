// models/UnitMeasurement.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UnitMeasurement = sequelize.define('UnitMeasurement', {
  measurementid: { // Соответствует столбцу 'measurementid'
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  bmi: { // Соответствует столбцу 'bmi'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0,    // Предполагается, что BMI не может быть отрицательным
      max: 100,  // Максимальное значение BMI (можно настроить по необходимости)
    },
  },
  metabolism: { // Соответствует столбцу 'metabolism'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0, // Предполагается, что метаболизм не может быть отрицательным
    },
  },
  body_age: { // Соответствует столбцу 'body_age'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0, // Предполагается, что возраст тела не может быть отрицательным
    },
  },
  date: { // Соответствует столбцу 'date'
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true, // Проверка на корректный формат даты
    },
  },
}, {
  tableName: 'measurements_in_units', // Имя таблицы в нижнем регистре
  timestamps: false,                  // Отключаем автоматическое добавление полей createdAt и updatedAt
  indexes: [
    {
      unique: false,
      fields: ['date'], // Добавляем индекс на поле 'date' для ускорения запросов по дате
    },
    // Добавьте другие индексы по необходимости
  ],
});

// Ассоциации (если применимо)
UnitMeasurement.associate = (models) => {
  // Пример: Связь с моделью Progress
  UnitMeasurement.hasMany(models.Progress, {
    foreignKey: 'unit_measurement_id',
    as: 'progressRecords',
  });

  // Добавьте другие ассоциации, если они необходимы
};

module.exports = UnitMeasurement;
