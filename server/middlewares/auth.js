const Clients = require('../../models/Client');

// Админ — это клиент с этим id. Раньше значение было зашито в admin/access.js.
const ADMIN_CLIENT_ID = Number(process.env.ADMIN_CLIENT_ID || 1);

const currentUser = (req) => (req.session && req.session.user) || null;

// Сессию пересоздаём при входе/регистрации — защита от session fixation
const startSession = (req, user) => new Promise((resolve, reject) => {
  req.session.regenerate((err) => {
    if (err) return reject(err);
    req.session.user = user;
    req.session.save((saveErr) => (saveErr ? reject(saveErr) : resolve()));
  });
});

const isAdmin = (user) => !!user && user.role === 'client' && user.id === ADMIN_CLIENT_ID;

const deny = (res, status) => {
  const error = status === 401 ? 'Требуется вход' : 'Недостаточно прав';
  return res.status(status).json({ error });
};

const requireAuth = (req, res, next) => {
  if (!currentUser(req)) return deny(res, 401);
  next();
};

const requireAdmin = (req, res, next) => {
  const user = currentUser(req);
  if (!user) return deny(res, 401);
  if (!isAdmin(user)) return deny(res, 403);
  next();
};

const requireCoachOrAdmin = (req, res, next) => {
  const user = currentUser(req);
  if (!user) return deny(res, 401);
  if (user.role !== 'coach' && !isAdmin(user)) return deny(res, 403);
  next();
};

// Данные клиента доступны самому клиенту, его тренеру и админу
const requireClientAccess = (paramName = 'clientId') => async (req, res, next) => {
  const user = currentUser(req);
  if (!user) return deny(res, 401);

  const clientId = Number(req.params[paramName]);
  if (!Number.isInteger(clientId)) {
    return res.status(400).json({ error: 'Некорректный id клиента' });
  }

  if (isAdmin(user)) return next();
  if (user.role === 'client') {
    return user.id === clientId ? next() : deny(res, 403);
  }

  try {
    const client = await Clients.findByPk(clientId, { attributes: ['coach_id'] });
    if (client && client.coach_id === user.id) return next();
    return deny(res, 403);
  } catch (error) {
    next(error);
  }
};

// Данные тренера доступны самому тренеру и админу
const requireCoachAccess = (paramName = 'coachId') => (req, res, next) => {
  const user = currentUser(req);
  if (!user) return deny(res, 401);

  const coachId = Number(req.params[paramName]);
  if (!Number.isInteger(coachId)) {
    return res.status(400).json({ error: 'Некорректный id тренера' });
  }

  if (isAdmin(user)) return next();
  if (user.role === 'coach' && user.id === coachId) return next();
  return deny(res, 403);
};

module.exports = {
  ADMIN_CLIENT_ID,
  currentUser,
  startSession,
  isAdmin,
  requireAuth,
  requireAdmin,
  requireCoachOrAdmin,
  requireClientAccess,
  requireCoachAccess
};
