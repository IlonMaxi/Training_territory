// models/Progress.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Progress = sequelize.define('Progress', {
    progressid: { // Соответствует столбцу 'progressid'
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    measurement_analysis: { // Соответствует столбцу 'measurement_analysis'
        type: DataTypes.TEXT,
        allowNull: true,
    },
    weight_analysis: { // Соответствует столбцу 'weight_analysis'
        type: DataTypes.TEXT,
        allowNull: true,
    },
    full_measurement_analysis: { // Соответствует столбцу 'full_measurement_analysis'
        type: DataTypes.TEXT,
        allowNull: true,
    },
    full_weight_analysis: { // Соответствует столбцу 'full_weight_analysis'
        type: DataTypes.TEXT,
        allowNull: true,
    },
    client_id: { // Соответствует столбцу 'client_id'
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'clients', // Имя таблицы в нижнем регистре
            key: 'clientid',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Или 'SET NULL', если необходимо
    },
    unit_measurement_id: { // Соответствует столбцу 'unit_measurement_id'
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'measurements_in_units', // Имя таблицы в нижнем регистре
            key: 'measurementid',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Или 'SET NULL', если необходимо
    },
    percentage_measurement_id: { // Соответствует столбцу 'percentage_measurement_id'
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'measurements_in_percentage', // Имя таблицы в нижнем регистре
            key: 'percentageid',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Или 'SET NULL', если необходимо
    },
    kilogram_measurement_id: { // Соответствует столбцу 'kilogram_measurement_id'
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'measurements_in_kilograms', // Имя таблицы в нижнем регистре
            key: 'kilogramid',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Или 'SET NULL', если необходимо
    },
    centimetre_measurement_id: { // Соответствует столбцу 'centimetre_measurement_id'
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'measurements_in_centimeters', // Имя таблицы в нижнем регистре
            key: 'centimetreid',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Или 'SET NULL', если необходимо
    },
    weight_id: { // Соответствует столбцу 'weight_id'
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'weights_on_machine', // Имя таблицы в нижнем регистре
            key: 'weightid',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Или 'SET NULL', если необходимо
    }
}, {
    tableName: 'progress', // Имя таблицы в нижнем регистре
    timestamps: false,      // Отключаем автоматическое добавление полей createdAt и updatedAt
    indexes: [
        {
            unique: false,
            fields: ['client_id'],
        },
        {
            unique: false,
            fields: ['unit_measurement_id'],
        },
        {
            unique: false,
            fields: ['percentage_measurement_id'],
        },
        {
            unique: false,
            fields: ['kilogram_measurement_id'],
        },
        {
            unique: false,
            fields: ['centimetre_measurement_id'],
        },
        {
            unique: false,
            fields: ['weight_id'],
        },
        // Добавьте другие индексы по необходимости
    ],
});

// Ассоциации
Progress.associate = (models) => {
    // Связь с моделью Client
    Progress.belongsTo(models.Client, {
        foreignKey: 'client_id',
        as: 'client',
    });

    // Связь с моделью MeasurementsInUnits
    Progress.belongsTo(models.MeasurementsInUnits, {
        foreignKey: 'unit_measurement_id',
        as: 'unitMeasurement',
    });

    // Связь с моделью MeasurementsInPercentage
    Progress.belongsTo(models.MeasurementsInPercentage, {
        foreignKey: 'percentage_measurement_id',
        as: 'percentageMeasurement',
    });

    // Связь с моделью MeasurementsInKilograms
    Progress.belongsTo(models.MeasurementsInKilograms, {
        foreignKey: 'kilogram_measurement_id',
        as: 'kilogramMeasurement',
    });

    // Связь с моделью MeasurementsInCentimeters
    Progress.belongsTo(models.MeasurementsInCentimeters, {
        foreignKey: 'centimetre_measurement_id',
        as: 'centimetreMeasurement',
    });

    // Связь с моделью WeightsOnMachine
    Progress.belongsTo(models.WeightsOnMachine, {
        foreignKey: 'weight_id',
        as: 'weight',
    });

    // Если есть другие ассоциации, добавьте их здесь
};

module.exports = Progress;
