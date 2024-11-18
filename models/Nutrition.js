// models/Nutrition.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Nutrition = sequelize.define('Nutrition', {
  foodid: { // Соответствует столбцу 'foodid'
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: { // Соответствует столбцу 'name'
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 255], // Минимальная длина 3 символа
    },
  },
  description: { // Соответствует столбцу 'description'
    type: DataTypes.TEXT,
    allowNull: true,
  },
  protein_amount: { // Соответствует столбцу 'protein_amount'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  fat_amount: { // Соответствует столбцу 'fat_amount'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  carbohydrate_amount: { // Соответствует столбцу 'carbohydrate_amount'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  calories: { // Соответствует столбцу 'calories'
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  water_amount: { // Соответствует столбцу 'water_amount'
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  date: { // Соответствует столбцу 'date'
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true,
    },
  },
  coach_id: { // Соответствует столбцу 'coach_id'
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'coaches', // Имя таблицы в нижнем регистре
      key: 'coachid',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL', // Или 'CASCADE', в зависимости от вашей бизнес-логики
  },
  client_id: { // Соответствует столбцу 'client_id'
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clients', // Имя таблицы в нижнем регистре
      key: 'clientid',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL', // Или 'CASCADE', в зависимости от вашей бизнес-логики
  },
  recipe_id: { // Соответствует столбцу 'recipe_id'
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'recipes', // Имя таблицы в нижнем регистре
      key: 'recipeid',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL', // Или 'CASCADE', в зависимости от вашей бизнес-логики
  },
}, {
  tableName: 'nutrition', // Имя таблицы в нижнем регистре
  timestamps: false,      // Отключаем автоматическое добавление полей createdAt и updatedAt
  indexes: [
    {
      unique: false,
      fields: ['name'],
    },
    {
      unique: false,
      fields: ['date'],
    },
    // Добавьте другие индексы по необходимости
  ],
});

// Ассоциации
Nutrition.associate = (models) => {
  // Связь с моделью Coach
  Nutrition.belongsTo(models.Coach, {
    foreignKey: 'coach_id',
    as: 'coach',
  });

  // Связь с моделью Client
  Nutrition.belongsTo(models.Client, {
    foreignKey: 'client_id',
    as: 'client',
  });

  // Связь с моделью Recipe
  Nutrition.belongsTo(models.Recipe, {
    foreignKey: 'recipe_id',
    as: 'recipe',
  });
};

module.exports = Nutrition;
