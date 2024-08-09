// models/Exercise.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exercise = sequelize.define('Exercise', {
  exercisesid: {
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
  Уровень_сложности: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  Тренажёр: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  id_весов: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'Упражнения',
  timestamps: false,
});

module.exports = Exercise;
