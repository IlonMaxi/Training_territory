// models/WorkoutExercise.js
// Связь «тренировка — упражнения». В workouts есть только одиночный
// exercise_id, поэтому программу из нескольких упражнений там не выразить.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkoutExercise = sequelize.define('WorkoutExercise', {
  workoutexerciseid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  workout_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'workouts',
      key: 'workoutid',
    },
    onDelete: 'CASCADE',
  },
  exercise_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'exercises',
      key: 'exerciseid',
    },
    onDelete: 'CASCADE',
  },
  // "order" — зарезервированное слово в SQL, поэтому position
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  sets: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // Строкой, потому что бывает «8–10», «до отказа», «45 секунд»
  reps: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'workout_exercises',
  timestamps: false,
});

module.exports = WorkoutExercise;
