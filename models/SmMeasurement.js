const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ZameryVSm = sequelize.define('SmMeasurement', {
  mcentimetreid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Обхват_груди: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  Обхват_талии: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  Обхват_бедер: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  Обхват_бицепса: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  Обхват_предплечья: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  Обхват_квадрицепса: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  Дата: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'Замеры_в_см',
  timestamps: false,
});

module.exports = ZameryVSm;
