const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ZameryVKg = sequelize.define('KgMeasurement', {
  mkilogramid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Вес: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  Жировая_масса: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  Скелетная_масса: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  Мышечная_масса: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  Содержание_воды: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  Костная_масса: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  lbm: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  Дата: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'Замеры_в_кг',
  timestamps: false,
});

module.exports = ZameryVKg;
