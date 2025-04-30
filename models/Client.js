// models/Client.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  clientid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  last_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  patronymic: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  birth_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: false,
    // unique: true, // Раскомментируй, если нужно
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  coach_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'coaches',
      key: 'coachid',
    },
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true, // Можно разрешить null, если фото ещё не загружено
  }
}, {
  tableName: 'clients',
  timestamps: false,
});

module.exports = Client;
