const express = require('express');

const Workout = require('../../models/Workout');
const WorkoutExercise = require('../../models/WorkoutExercise');
const Exercise = require('../../models/Exercise');

const { currentUser } = require('../middlewares/auth');
const { getBlockedMuscles } = require('../services/healthProfileService');

const router = express.Router();

/*
  Учёт травм. Упражнение на закрытую группу мышц убирается из программы.
  Если после этого в программе не остаётся ничего — программа целиком уходит
  в список исключённых, и помощник объясняет причину, а не молча её прячет.
*/
const applyHealthProfile = (programs, blocked) => {
  if (!blocked.length) return { safe: programs, excluded: [], trimmed: [] };

  const isBlocked = (exercise) => exercise.muscleGroup && blocked.includes(exercise.muscleGroup);

  const safe = [];
  const excluded = [];
  const trimmed = [];

  for (const program of programs) {
    const allowed = program.exercises.filter(exercise => !isBlocked(exercise));
    const removed = program.exercises.length - allowed.length;

    if (!allowed.length) {
      excluded.push(program.name);
      continue;
    }

    if (removed) trimmed.push({ name: program.name, removed });
    safe.push({ ...program, exercises: allowed, removedExercises: removed });
  }

  return { safe, excluded, trimmed };
};

// Программы-шаблоны: тренировки без владельца (coach_id IS NULL).
// Их наполняет тренер через админ-панель, показывает помощник в чате.
const PROGRAM_INCLUDE = [{
  model: WorkoutExercise,
  as: 'items',
  include: [{ model: Exercise, as: 'exercise' }]
}];

// Колонка duration имеет тип interval, и драйвер отдаёт её объектом
// вида { hours: 1, minutes: 5 } — приводим к минутам, чтобы клиенту
// не приходилось разбирать внутреннее представление Postgres
const toMinutes = (interval) => {
  if (!interval) return null;
  if (typeof interval === 'number') return interval;

  if (typeof interval === 'object') {
    const { days = 0, hours = 0, minutes = 0, seconds = 0 } = interval;
    return days * 1440 + hours * 60 + minutes + Math.round(seconds / 60);
  }

  const match = String(interval).match(/^(\d+):(\d+)/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};

const toProgram = (workout) => ({
  id: workout.workoutid,
  name: workout.name,
  description: workout.description,
  difficulty: workout.difficulty,
  durationMinutes: toMinutes(workout.duration),
  type: workout.workout_type,
  exercises: (workout.items || [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(item => ({
      name: item.exercise ? item.exercise.name : 'Упражнение удалено',
      muscleGroup: item.exercise ? item.exercise.muscle_group : null,
      machine: item.exercise ? item.exercise.machine : null,
      sets: item.sets,
      reps: item.reps
    }))
});

const normalize = (text) => String(text || '')
  .toLowerCase()
  .replace(/ё/g, 'е')
  .replace(/[^a-zа-я0-9\s]+/g, ' ')
  .split(/\s+/)
  .filter(Boolean);

// Сравниваем по началу слова: «спину» находит «Спина», «ног» — «Ноги».
// Полноценная морфология тут избыточна, а опечатки уже исправил ML-сервис.
const looksSame = (a, b) => {
  const len = Math.min(4, a.length, b.length);
  if (len < 3) return a === b;
  return a.slice(0, len) === b.slice(0, len);
};

// Считаем очки, а не просто «совпало/нет». Название весит больше описания:
// «тренировка ноги» должно выигрывать у программы «Ноги», а не у всех сразу.
const FIELD_WEIGHTS = [
  { get: (p) => p.name, weight: 5 },
  { get: (p) => p.type, weight: 2 },
  { get: (p) => p.description, weight: 1 },
  { get: (p) => p.exercises.map(e => e.name).join(' '), weight: 1 }
];

const allWords = (program) => normalize(
  [program.name, program.type, program.description,
    ...program.exercises.map(e => e.name)].join(' ')
);

/*
  Вес слова по редкости (упрощённый IDF). Слово «тренировка» есть в описании
  каждой программы и не несёт информации — его вклад падает до нуля.
  «Широчайшие» встречается в одной программе и потому решает исход.
  Без этого «когда следующая тренировка» совпадало со всеми шестью сразу.
*/
const buildWordWeights = (programs, queryWords) => {
  const weights = {};
  for (const word of queryWords) {
    const docs = programs.filter(p => allWords(p).some(target => looksSame(word, target))).length;
    weights[word] = docs ? Math.log(programs.length / docs) : 0;
  }
  return weights;
};

const scoreProgram = (program, queryWords, wordWeights) => FIELD_WEIGHTS.reduce((score, field) => {
  const words = normalize(field.get(program));
  const hits = queryWords.filter(word => words.some(target => looksSame(word, target)));
  const value = hits.reduce((sum, word) => sum + (wordWeights[word] || 0), 0);
  return score + value * field.weight;
}, 0);

// GET /workouts/programs        — все шаблоны
// GET /workouts/programs?q=...  — только подходящие под запрос
router.get('/workouts/programs', async (req, res) => {
  try {
    const workouts = await Workout.findAll({
      where: { coach_id: null },
      include: PROGRAM_INCLUDE,
      order: [['workoutid', 'ASC']]
    });

    const all = workouts.map(toProgram).filter(p => p.exercises.length);

    // Профиль здоровья берём по вошедшему клиенту: подставить чужой id
    // из запроса нельзя, потому что мы его и не читаем
    const user = currentUser(req);
    const health = user && user.role === 'client'
      ? await getBlockedMuscles(user.id)
      : { blocked: [], injuries: [], allergies: [] };

    const { safe, excluded, trimmed } = applyHealthProfile(all, health.blocked);
    const health_info = {
      injuries: health.injuries,
      excluded,
      trimmed
    };

    const queryWords = normalize(req.query.q).filter(word => word.length >= 3);

    if (!queryWords.length) {
      return res.json({ programs: safe, matched: false, health: health_info });
    }

    const wordWeights = buildWordWeights(safe, queryWords);
    const scored = safe
      .map(program => ({ program, score: scoreProgram(program, queryWords, wordWeights) }))
      .filter(entry => entry.score > 0);

    if (!scored.length) {
      return res.json({ programs: safe, matched: false, health: health_info });
    }

    // Оставляем только лучшие по очкам — обычно это одна программа
    const best = Math.max(...scored.map(entry => entry.score));
    const matched = scored.filter(entry => entry.score === best).map(entry => entry.program);

    res.json({ programs: matched, matched: true, health: health_info });
  } catch (error) {
    console.error('Ошибка при получении программ тренировок:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/workouts', async (req, res) => {
  try {
    const workouts = await Workout.findAll();
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/workouts', async (req, res) => {
  try {
    const workout = await Workout.create(req.body);
    res.status(201).json(workout);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/workouts/:coachId', async (req, res) => {
  const { coachId } = req.params;

  try {
    const workouts = await Workout.findAll({
      where: {
        coach_id: coachId
      }
    });

    if (!workouts.length) {
      return res.status(404).json({ error: 'Workouts not found for this coach.' });
    }

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
