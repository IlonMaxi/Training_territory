// models/Workout.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Exercise = require('./Exercise'); // Импорт модели упражнений
const Coach = require('./Coach'); // Импорт модели тренеров

const Workout = sequelize.define('Workout', {
  workoutid: { // Соответствует столбцу 'workoutid'
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
  difficulty: { // Соответствует столбцу 'difficulty'
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      isIn: [['easy', 'medium', 'hard']], // Пример: ограничение допустимых значений
    },
  },
  duration: { // Соответствует столбцу 'duration'
    type: DataTypes.STRING, // Хранение как строка
    allowNull: true,
    validate: {
      // При необходимости можно добавить регулярное выражение для формата времени
    },
  },
  workout_type: { // Соответствует столбцу 'workout_type'
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'individual',
    validate: {
      isIn: [['individual', 'group']], // Пример: допустимые значения
    },
  },
  max_participants: { // Соответствует столбцу 'max_participants'
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
    validate: {
      min: 1, // Минимальное значение 1
    },
  },
  coach_id: { // Соответствует столбцу 'coach_id'
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'coaches', // Имя таблицы в нижнем регистре
      key: 'coachid',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE', // Или 'SET NULL', в зависимости от вашей бизнес-логики
  },
  exercise_id: { // Соответствует столбцу 'exercise_id'
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'exercises', // Имя таблицы в нижнем регистре
      key: 'exerciseid',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE', // Или 'SET NULL', в зависимости от вашей бизнес-логики
  }
}, {
  tableName: 'workouts', // Имя таблицы в нижнем регистре
  timestamps: false,      // Отключаем автоматическое добавление полей createdAt и updatedAt
  indexes: [
    {
      unique: false,
      fields: ['coach_id'],
    },
    {
      unique: false,
      fields: ['exercise_id'],
    },
    // Добавьте другие индексы по необходимости
  ],
});

// Ассоциации
Workout.associate = (models) => {
  // Связь с моделью Exercise
  Workout.belongsTo(models.Exercise, {
    foreignKey: 'exercise_id',
    as: 'exercise',
  });

  // Связь с моделью Coach
  Workout.belongsTo(models.Coach, {
    foreignKey: 'coach_id',
    as: 'coach',
  });
};

module.exports = Workout;
