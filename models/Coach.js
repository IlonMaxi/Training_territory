// models/Coach.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coach = sequelize.define('Coach', {
  coachid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Фамилия: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  Имя: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  Отчество: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  Дата_рождения: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  Адрес_электронной_почты: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  Номер_телефона: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  Специализация: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  Опыт: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  Логин: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  Пароль: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'Тренеры',
  timestamps: false,
});

module.exports = Coach;
