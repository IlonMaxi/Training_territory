const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  scheduleid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Дата: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  Начало: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  Место: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  Время_окончания: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  id_тренировки: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Тренировки', // Имя таблицы, к которой ссылается внешний ключ
      key: 'workoutid',  // Поле, на которое ссылается внешний ключ
    }
  },
  id_тренера: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Тренеры', // Имя таблицы, к которой ссылается внешний ключ
      key: 'coachid',  // Поле, на которое ссылается внешний ключ
    }
  }
}, {
  tableName: 'Расписание',
  timestamps: false,
});

module.exports = Schedule;
