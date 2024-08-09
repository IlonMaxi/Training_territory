const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WeightsOnMachine = sequelize.define('WeightsOnMachine', {
  mweightid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Вес_на_тренажере: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  Дата: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'Весы_на_тренажере',
  timestamps: false,
});

module.exports = WeightsOnMachine;
