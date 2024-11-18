// models/Exercise.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exercise = sequelize.define('Exercise', {
  exerciseid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  difficulty_level: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  machine: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  weight_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'weights_on_machine', // Имя таблицы в нижнем регистре
      key: 'weightid',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL', // Или 'CASCADE', в зависимости от вашей бизнес-логики
  }
}, {
  tableName: 'exercises', // Имя таблицы в нижнем регистре
  timestamps: false,      // Отключаем автоматическое добавление полей createdAt и updatedAt
});

Exercise.associate = (models) => {
  // Ассоциация с моделью WeightsOnMachine
  Exercise.belongsTo(models.WeightsOnMachine, {
    foreignKey: 'weight_id',
    as: 'weight',
  });

  // Если у вас есть ассоциации с моделями Workout или другими, добавьте их здесь
  // Пример:
  // Exercise.hasMany(models.Workout, {
  //   foreignKey: 'exercise_id',
  //   as: 'workouts',
  // });
};

module.exports = Exercise;