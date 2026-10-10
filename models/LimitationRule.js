// models/LimitationRule.js
// Правила безопасности: какая область тела какие группы мышц закрывает.
// Лежат в базе, а не в коде, — тренер правит их через админ-панель,
// не дожидаясь программиста.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LimitationRule = sequelize.define('LimitationRule', {
  ruleid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // Как это называет клиент: «колено», «поясница», «плечо»
  area: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  // Группа мышц из справочника упражнений, которую нельзя нагружать
  muscle_group: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  tableName: 'limitation_rules',
  timestamps: false,
});

module.exports = LimitationRule;
