// models/ClientSchedule.js
const { Sequelize, DataTypes } = require('sequelize'); 
const sequelize = require('../config/database');

const ClientSchedule = sequelize.define('ClientSchedule', {
  clientscheduleid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clients', // Имя таблицы в нижнем регистре
      key: 'clientid',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  schedule_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'schedule', // Имя таблицы в нижнем регистре
      key: 'scheduleid',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'scheduled', // Соответствует значению по умолчанию в базе данных
  },
}, {
  tableName: 'client_schedule', // Имя таблицы в нижнем регистре
  timestamps: false,
});

module.exports = ClientSchedule;