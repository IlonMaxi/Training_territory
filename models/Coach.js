// models/Coach.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coach = sequelize.define('Coach', {
  coachid: {
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
    // Если требуется уникальность email, добавьте `unique: true`
    // unique: true,
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  specialization: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  experience: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true, // Соответствует ограничению UNIQUE в таблице
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true, // Соответствует значению по умолчанию в таблице
  }
}, {
  tableName: 'coaches', // Имя таблицы в нижнем регистре
  timestamps: false,    // Отключаем автоматическое добавление полей createdAt и updatedAt
});

module.exports = Coach;
