const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Progress = sequelize.define('Progress', {
    progressid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    Анализ_замеров: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    Анализ_весов: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    Полный_анализ_замеров: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    Полный_анализ_весов: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    id_клиента: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_замеры_в_ед: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_замеры_в_процент: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_замеры_в_кг: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_замеры_в_см: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_вес: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'Прогресс',
    timestamps: false,
});

module.exports = Progress;
