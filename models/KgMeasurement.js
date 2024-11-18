// models/KgMeasurement.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KgMeasurement = sequelize.define('KgMeasurement', {
  kilogramid: { // Соответствует столбцу 'kilogramid'
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  weight: { // Соответствует столбцу 'weight'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  fat_mass: { // Соответствует столбцу 'fat_mass'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  skeletal_mass: { // Соответствует столбцу 'skeletal_mass'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  muscle_mass: { // Соответствует столбцу 'muscle_mass'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  water_content: { // Соответствует столбцу 'water_content'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  bone_mass: { // Соответствует столбцу 'bone_mass'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  lbm: { // Соответствует столбцу 'lbm'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  date: { // Соответствует столбцу 'date'
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'measurements_in_kilograms', // Имя таблицы в нижнем регистре
  timestamps: false, // Отключаем автоматическое добавление полей createdAt и updatedAt
});

module.exports = KgMeasurement;
