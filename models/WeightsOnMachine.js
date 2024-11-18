// models/WeightsOnMachine.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WeightsOnMachine = sequelize.define('WeightsOnMachine', {
  weightid: { // Соответствует столбцу 'weightid'
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  machine_weight: { // Соответствует столбцу 'machine_weight'
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0, // Минимальное значение 0, если применимо
    },
  },
  date: { // Соответствует столбцу 'date'
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
    },
  },
}, {
  tableName: 'weights_on_machine', // Имя таблицы в нижнем регистре
  timestamps: false,               // Отключаем автоматическое добавление полей createdAt и updatedAt
  indexes: [
    {
      unique: false,
      fields: ['date'], // Добавляем индекс на поле 'date' для оптимизации запросов
    },
    // Добавьте другие индексы по необходимости
  ],
});

module.exports = WeightsOnMachine;
