// models/Client.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  clientid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  last_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  patronymic: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  birth_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: false,
    // Если в базе данных поле `username` также уникально, раскомментируйте следующую строку:
    // unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  coach_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'coaches', // Название таблицы в базе данных должно быть в нижнем регистре
      key: 'coachid',
    },
  },
}, {
  tableName: 'clients', // Имя таблицы в базе данных в нижнем регистре
  timestamps: false,    // Отключаем автоматическое добавление полей createdAt и updatedAt
});

module.exports = Client;
