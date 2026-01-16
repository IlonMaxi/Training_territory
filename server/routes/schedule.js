const express = require('express');
const { Sequelize } = require('sequelize');
const sequelize = require('../../config/database');

const Schedule = require('../../models/Schedule');

const router = express.Router();

router.get('/schedule', async (req, res) => {
  try {
    const schedule = await Schedule.findAll();
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/schedule', async (req, res) => {
  try {
    const scheduleItem = await Schedule.create(req.body);
    res.status(201).json(scheduleItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/schedule/:coachId', async (req, res) => {
  const { coachId } = req.params;

  try {
    const schedule = await sequelize.query(`
      SELECT 
        s.scheduleid AS scheduleId, 
        s.date, 
        s.start_time AS startTime, 
        s.location, 
        s.end_time AS endTime, 
        w.workoutid AS workoutId, 
        w.name AS workout_name, 
        w.description AS workout_description,
        e.exerciseid AS exerciseId,
        e.name AS exercise_name,
        e.description AS exercise_description,
        e.machine AS equipment
      FROM 
        schedule AS s
      JOIN 
        workouts AS w ON s.workout_id = w.workoutid
      JOIN 
        exercises AS e ON w.exercise_id = e.exerciseid
      WHERE 
        s.coach_id = :coachId
    `, {
      replacements: { coachId },
      type: Sequelize.QueryTypes.SELECT
    });

    if (!schedule.length) {
      return res.status(404).json({ error: 'Расписание не найдено для этого тренера.' });
    }

    res.json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/schedule/client/:clientId', async (req, res) => {
  const { clientId } = req.params;

  try {
    const schedule = await sequelize.query(`
      SELECT 
        s.scheduleid AS scheduleId, 
        s.date, 
        s.start_time AS startTime, 
        s.location, 
        s.end_time AS endTime, 
        w.workoutid AS workoutId, 
        w.name AS workout_name, 
        w.description AS workout_description,
        e.exerciseid AS exerciseId,
        e.name AS exercise_name,
        e.description AS exercise_description,
        e.machine AS equipment,
        c.clientid AS clientId,
        c.last_name AS client_lastname,
        c.first_name AS client_firstname
      FROM 
        schedule AS s
      JOIN 
        workouts AS w ON s.workout_id = w.workoutid
      JOIN 
        exercises AS e ON w.exercise_id = e.exerciseid
      JOIN 
        client_schedule AS cs ON s.scheduleid = cs.schedule_id
      JOIN 
        clients AS c ON cs.client_id = c.clientid
      WHERE 
        c.clientid = :clientId
    `, {
      replacements: { clientId },
      type: Sequelize.QueryTypes.SELECT
    });

    if (!schedule.length) {
      return res.status(404).json({ error: 'Расписание не найдено для этого клиента.' });
    }

    res.json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/schedule/:scheduleId', async (req, res) => {
  const { scheduleId } = req.params;
  try {
    const deleted = await Schedule.destroy({ where: { scheduleid: scheduleId } });
    if (deleted) {
      res.json({ message: 'Тренировка отменена' });
    } else {
      res.status(404).json({ error: 'Тренировка не найдена' });
    }
  } catch (error) {
    console.error('Ошибка при удалении тренировки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
