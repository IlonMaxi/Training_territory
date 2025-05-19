const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Nutrition = sequelize.define('Nutrition', {
  foodid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 255],
    },
  },
  protein_amount: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: { min: 0 },
  },
  fat_amount: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: { min: 0 },
  },
  carbohydrate_amount: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: { min: 0 },
  },
  calories: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 0 },
  },
  water_amount: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: { min: 0 },
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: { isDate: true },
  },
  coach_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'coaches', key: 'coachid' },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'clients', key: 'clientid' },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  recipe_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'recipes', key: 'recipeid' },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  meal_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 50],
    },
  },
}, {
  tableName: 'nutrition',
  timestamps: false,
  indexes: [
    { unique: false, fields: ['name'] },
    { unique: false, fields: ['date'] }
  ],
});

Nutrition.associate = (models) => {
  Nutrition.belongsTo(models.Coach, { foreignKey: 'coach_id', as: 'coach' });
  Nutrition.belongsTo(models.Client, { foreignKey: 'client_id', as: 'client' });
  Nutrition.belongsTo(models.Recipe, { foreignKey: 'recipe_id', as: 'recipe' });
};

module.exports = Nutrition;
