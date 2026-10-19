// Неделя с понедельника и мелкие помощники для расписания клиента и тренера

// «2026-10-12» из БД — это дата без часового пояса: разбираем её как местную,
// иначе new Date() считает её полуночью UTC и западнее Гринвича день съезжает
export function toDate(value) {
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  return new Date(value);
}

export function startOfDay(date) {
  const day = toDate(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

export function addDays(date, days) {
  const day = toDate(date);
  day.setDate(day.getDate() + days);
  return day;
}

export function startOfWeek(date) {
  const day = startOfDay(date);
  // getDay(): 0 — воскресенье; сдвигаем так, чтобы неделя начиналась с понедельника
  return addDays(day, -((day.getDay() + 6) % 7));
}

export function weekDays(start) {
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function isSameDay(a, b) {
  return Boolean(a && b) && toDate(a).toDateString() === toDate(b).toDateString();
}

// Дата для <input type="date">: «2026-10-12» по местному времени
export function toISODate(date) {
  const day = toDate(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
}

// Время из БД приходит как «18:00:00» — показываем «18:00»
export function formatTime(time) {
  return (time && time.slice && time.slice(0, 5)) || '';
}

// «18:30» → 1110 минут от начала суток
export function timeToMinutes(time) {
  const match = String(time || '').match(/^(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

// 1110 → «18:30»
export function minutesToTime(minutes) {
  const total = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

// 90 → «1 ч 30 мин»
export function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '0 мин';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} мин`;
  return rest ? `${hours} ч ${rest} мин` : `${hours} ч`;
}

export function byStartTime(a, b) {
  return (a.starttime || '').localeCompare(b.starttime || '');
}

const week = {
  toDate, startOfDay, addDays, startOfWeek, weekDays, isSameDay, toISODate,
  formatTime, timeToMinutes, minutesToTime, formatDuration, byStartTime
};

export default week;
