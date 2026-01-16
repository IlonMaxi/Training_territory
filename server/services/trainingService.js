const { Op } = require('sequelize');
const sequelize = require('../../config/database');

const Coaches = require('../../models/Coach');
const Clients = require('../../models/Client');
const Schedule = require('../../models/Schedule');
const ClientSchedule = require('../../models/ClientSchedule');
const Workout = require('../../models/Workout');

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const assignTraining = async (coachId, payload) => {
  const { client_id, workout_id, date, start_time, end_time, location } = payload;
  const transaction = await sequelize.transaction();

  try {
    const coach = await Coaches.findByPk(coachId, { transaction });
    if (!coach) {
      throw createError(404, 'Тренер не найден.');
    }

    const client = await Clients.findOne({ where: { clientid: client_id, coach_id: coachId }, transaction });
    if (!client) {
      throw createError(404, 'Клиент не найден или не принадлежит этому тренеру.');
    }

    const workout = await Workout.findOne({ where: { workoutid: workout_id, coach_id: coachId }, transaction });
    if (!workout) {
      throw createError(404, 'Тренировка не найдена или не принадлежит этому тренеру.');
    }

    const existingSchedule = await Schedule.findOne({
      where: {
        coach_id: coachId,
        date,
        [Op.or]: [
          {
            start_time: {
              [Op.between]: [start_time, end_time]
            }
          },
          {
            end_time: {
              [Op.between]: [start_time, end_time]
            }
          },
          {
            [Op.and]: [
              { start_time: { [Op.lte]: start_time } },
              { end_time: { [Op.gte]: end_time } }
            ]
          }
        ]
      },
      transaction
    });

    if (existingSchedule) {
      throw createError(400, 'В это время уже запланирована другая тренировка.');
    }

    const newSchedule = await Schedule.create({
      date,
      start_time,
      end_time,
      location,
      workout_id,
      coach_id: coachId
    }, { transaction });

    await ClientSchedule.create({
      client_id,
      schedule_id: newSchedule.scheduleid,
      status: 'scheduled'
    }, { transaction });

    await transaction.commit();

    return newSchedule;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = { assignTraining };
