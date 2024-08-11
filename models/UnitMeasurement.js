const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UnitMeasurement = sequelize.define('UnitMeasurement', {
  mmeasurementid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  bmi: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false,
  },
  Метаболизм: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false,
  },
  Возраст_тела: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false,
  },
  Дата: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, {
  tableName: 'Замеры_в_единицах',
  timestamps: false,
});

module.exports = UnitMeasurement;
