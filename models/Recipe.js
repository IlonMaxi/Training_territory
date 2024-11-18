// models/Recipe.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recipe = sequelize.define('Recipe', {
  recipeid: { // Соответствует столбцу 'recipeid'
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
  ingredients: { // Соответствует столбцу 'ingredients'
    type: DataTypes.TEXT,
    allowNull: true,
  },
  preparation_time: { // Соответствует столбцу 'preparation_time'
    type: DataTypes.STRING, // Sequelize не поддерживает тип INTERVAL, используем STRING
    allowNull: true,
    validate: {
      // Добавьте валидацию формата, если требуется
    },
  },
  instructions: { // Соответствует столбцу 'instructions'
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'recipes', // Имя таблицы в нижнем регистре
  timestamps: false,    // Отключаем автоматическое добавление полей createdAt и updatedAt
  indexes: [
    {
      unique: false,
      fields: ['name'], // Добавляем индекс на поле 'name' для оптимизации поиска
    },
    // Добавьте другие индексы по необходимости
  ],
});

// Ассоциации (если применимо)
// Например, если рецепт может быть связан с моделью Nutrition
Recipe.associate = (models) => {
  Recipe.hasMany(models.Nutrition, {
    foreignKey: 'recipe_id',
    as: 'nutritionRecords',
  });
};

module.exports = Recipe;
