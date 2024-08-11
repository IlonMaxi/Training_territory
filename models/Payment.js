const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  paymentid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Дата_платежа: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  Срок_действия: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  Сумма: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: false,
  },
  Тариф: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  id_клиента: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Клиенты', // Имя таблицы, к которой ссылается внешний ключ
      key: 'clientid',  // Поле, на которое ссылается внешний ключ
    }
  }
}, {
  tableName: 'Оплата',
  timestamps: false,
});

module.exports = Payment;
