const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PercentageMeasurement = sequelize.define('PercentageMeasurement', {
  mpercentageid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Процент_жира: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false,
  },
  Процент_скелетной_массы: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false,
  },
  Динамика_мышц: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false,
  },
  Вода_в_организме: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false,
  },
  Белок: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false,
  },
  Жирность: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false,
  },
  Дата: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, {
  tableName: 'Замеры_в_процент',
  timestamps: false,
});

module.exports = PercentageMeasurement;
