// models/Payments.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payments = sequelize.define('Payments', {
  paymentid: { // Соответствует столбцу 'paymentid'
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  payment_date: { // Соответствует столбцу 'payment_date'
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
    },
  },
  tariff: { // Соответствует столбцу 'tariff'
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      len: [0, 255], // Максимальная длина 255 символов
    },
  },
  tariff_type: { // Соответствует столбцу 'tariff_type'
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: [0, 20], // Максимальная длина 20 символов
    },
  },
  training_sessions: { // Соответствует столбцу 'training_sessions'
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0, // Минимальное значение 0
    },
  },
  used_training_sessions: { // Соответствует столбцу 'used_training_sessions'
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0, // Минимальное значение 0
    },
  },
  start_date: { // Соответствует столбцу 'start_date'
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true,
    },
  },
  end_date: { // Соответствует столбцу 'end_date'
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true,
    },
  },
  amount: { // Соответствует столбцу 'amount'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false,
    validate: {
      min: 0, // Минимальное значение 0
    },
  },
  client_id: { // Соответствует столбцу 'client_id'
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clients', // Имя таблицы в нижнем регистре
      key: 'clientid',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE', // Или 'SET NULL', в зависимости от вашей бизнес-логики
  },
}, {
  tableName: 'payments', // Имя таблицы в нижнем регистре
  timestamps: false,      // Отключаем автоматическое добавление полей createdAt и updatedAt
  indexes: [
    {
      unique: false,
      fields: ['payment_date'],
    },
    {
      unique: false,
      fields: ['client_id'],
    },
    // Добавьте другие индексы по необходимости
  ],
});

// Ассоциации
Payments.associate = (models) => {
  // Связь с моделью Client
  Payments.belongsTo(models.Client, {
    foreignKey: 'client_id',
    as: 'client',
  });
};

module.exports = Payments;
