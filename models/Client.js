// models/Client.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  clientid: {
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
  Логин: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  Пароль: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  id_тренера: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'Клиенты',
  timestamps: false,
});

module.exports = Client;
