const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClientSchedule = sequelize.define('ClientSchedule', {
  client_schedule_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_клиента: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Клиенты', // Имя таблицы, к которой ссылается внешний ключ
      key: 'clientid',  // Поле, на которое ссылается внешний ключ
    }
  },
  id_расписания: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Расписание', // Имя таблицы, к которой ссылается внешний ключ
      key: 'scheduleid',   // Поле, на которое ссылается внешний ключ
    }
  },
}, {
  tableName: 'Клиенты_Расписание',
  timestamps: false,
});

module.exports = ClientSchedule;
