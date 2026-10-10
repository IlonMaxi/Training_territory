// models/ClientLimitation.js
// Ограничения клиента: травмы и аллергии. Травма убирает опасные упражнения
// из рекомендаций, аллергия — блюда с этим ингредиентом.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClientLimitation = sequelize.define('ClientLimitation', {
  limitationid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'clientid',
    },
    onDelete: 'CASCADE',
  },
  // 'injury' — травма или больное место, 'allergy' — пищевая аллергия
  kind: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  // Для травмы — область тела («колено»), для аллергии — продукт («орехи»)
  value: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'client_limitations',
  timestamps: false,
});

module.exports = ClientLimitation;
