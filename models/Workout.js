const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Exercise = require('./Exercise'); // Импортируем модель упражнений

const Workout = sequelize.define('Workout', {
  workoutid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Название: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  Описание: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  Сложность: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  Длительность: {
    type: DataTypes.STRING, // Хранение как строка
    allowNull: true,
  },
  id_тренера: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Тренеры',
      key: 'coachid',
    }
  },
  id_упражнения: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Упражнения',
      key: 'exercisesid',
    }
  }
}, {
  tableName: 'Тренировки',
  timestamps: false,
});

// Определение связи с упражнениями
Workout.belongsTo(Exercise, {
  foreignKey: 'id_упражнения',
  as: 'exercise'
});

module.exports = Workout;
