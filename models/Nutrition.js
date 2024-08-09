// models/Nutrition.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Nutrition = sequelize.define('Nutrition', {
  foodid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Название: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  Описание: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  Количество_белков: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false,
  },
  Количество_жиров: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false,
  },
  Количество_углеводов: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false,
  },
  Калории: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_тренера: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  id_клиента: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  Дата: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'Питание',
  timestamps: false,
});

module.exports = Nutrition;
