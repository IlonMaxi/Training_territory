// models/Coach.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coach = sequelize.define('Coach', {
  coachid: {
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
    // unique: true, // Раскомментируй, если нужно
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  specialization: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  experience: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  gender: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,
  }
}, {
  tableName: 'coaches',
  timestamps: false,
});

module.exports = Coach;
