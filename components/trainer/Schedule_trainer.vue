<template>
  <section id="schedule" class="tt-container" aria-labelledby="schedule-title">
    <SectionHead eyebrow="Расписание" icon="fa-solid fa-calendar-days" title-id="schedule-title"
      lead="Выберите день — увидите занятия, окна между ними и загрузку недели. Отменить тренировку можно прямо из карточки.">
      Занятия на <span class="tt-accent">неделю</span>
    </SectionHead>

    <Reveal class="tt-board board" :y="16" :amount="0.1">
      <WeekStrip :week-start="weekStart" :selected="selectedDay" :count-for="countFor" @select="selectDay"
        @prev="shiftWeek(-1)" @next="shiftWeek(1)" @today="goToday">
        <template #controls>
          <div class="tt-segment" role="group" aria-label="Режим просмотра">
            <button type="button" :class="{ 'is-active': view === 'day' }" @click="view = 'day'">
              <i class="fa-solid fa-calendar-day"></i> День
            </button>
            <button type="button" :class="{ 'is-active': view === 'week' }" @click="view = 'week'">
              <i class="fa-solid fa-calendar-week"></i> Неделя
            </button>
          </div>
        </template>
      </WeekStrip>

      <p v-if="error" class="tt-note tt-note--error"><i class="fa-solid fa-circle-exclamation"></i> {{ error }}</p>
      <transition name="tt-swap">
        <p v-if="notice" class="tt-note tt-note--ok" role="status">
          <i class="fa-solid fa-circle-check"></i> {{ notice }}
        </p>
      </transition>

      <transition name="tt-swap" mode="out-in">
        <!-- Режим дня: лента занятий и сводка -->
        <div v-if="view === 'day'" :key="`day-${selectedKey}`" class="day-view">
          <div class="column">
            <h3 class="tt-col-title">
              <span class="tt-col-icon"><i class="fa-solid fa-dumbbell"></i></span>
              {{ dayTitle }}
              <span v-if="!loading" class="tt-chip">{{ daySessions.length }}</span>
            </h3>

            <div v-if="loading" class="timeline">
              <div class="tt-skeleton skeleton"></div>
              <div class="tt-skeleton skeleton"></div>
            </div>

            <ol v-else-if="daySessions.length" class="timeline">
              <template v-for="entry in timeline">
                <li v-if="entry.type === 'gap'" :key="entry.key" :class="['gap', { 'gap--warn': entry.warn }]">
                  <span class="gap-pill">
                    <i :class="entry.warn ? 'fa-solid fa-triangle-exclamation' : 'fa-regular fa-hourglass-half'"></i>
                    {{ entry.label }}
                  </span>
                </li>
                <li v-else :key="entry.key" class="slot tt-stagger" :style="{ '--i': entry.index }">
                  <SessionCard :session="entry.session" @open="openDetails(entry.session)">
                    <template #actions>
                      <button type="button" class="cancel-link" @click="askCancel(entry.session)">
                        <i class="fa-solid fa-xmark"></i> Отменить
                      </button>
                    </template>
                  </SessionCard>
                </li>
              </template>
            </ol>

            <div v-else class="tt-empty">
              <i class="fa-solid fa-mug-hot"></i>
              Занятий нет — свободный день
              <button type="button" class="tt-btn tt-btn--ghost tt-btn--sm" @click="$emit('plan', selectedDay)">
                <i class="fa-solid fa-calendar-plus"></i> Назначить тренировку
              </button>
            </div>
          </div>

          <aside class="tt-tile summary" aria-label="Сводка дня">
            <h3 class="tt-col-title">
              <span class="tt-col-icon tt-col-icon--blue"><i class="fa-solid fa-chart-simple"></i></span>
              Сводка дня
            </h3>

            <div class="stats">
              <div class="tt-tile stat">
                <b>{{ daySessions.length }}</b>
                <span>{{ sessionsWord(daySessions.length) }}</span>
              </div>
              <div class="tt-tile stat">
                <b>{{ dayHours.value }}</b>
                <span>{{ dayHours.word }} в зале</span>
              </div>
              <div class="tt-tile stat">
                <b>{{ dayClients }}</b>
                <span>{{ clientsWord(dayClients) }}</span>
              </div>
            </div>

            <p v-if="daySpan" class="span-line">
              <i class="fa-regular fa-clock"></i> С {{ daySpan.from }} до {{ daySpan.to }}
            </p>

            <div class="load">
              <span class="load-label">Загрузка недели</span>
              <div class="bars">
                <button v-for="day in weekLoad" :key="day.key" type="button"
                  :class="['bar', { 'is-selected': day.selected, 'is-today': day.today }]"
                  :aria-label="`${day.name}: ${day.count} ${sessionsWord(day.count)}`" @click="selectDay(day.date)">
                  <span class="bar-count">{{ day.count || '' }}</span>
                  <span class="bar-track"><span class="bar-fill" :style="{ '--h': day.share }"></span></span>
                  <span class="bar-name">{{ day.name }}</span>
                </button>
              </div>
            </div>

            <button type="button" class="tt-btn tt-btn--primary tt-btn--sm plan-btn" @click="$emit('plan', selectedDay)">
              <i class="fa-solid fa-calendar-plus"></i> Назначить на {{ shortDay }}
            </button>
          </aside>
        </div>

        <!-- Режим недели: семь колонок, клик по дню открывает его -->
        <WeekGrid v-else key="week" :week-start="weekStart" :selected="selectedDay" :count-for="countFor"
          empty-text="Свободно" @open="openDay">
          <template #default="{ date }">
            <SessionCard v-for="(session, index) in sessionsOn(date)" :key="`s-${session.scheduleid || index}`"
              :session="session" compact @open="openDetails(session)" />
          </template>
        </WeekGrid>
      </transition>
    </Reveal>

    <ScheduleDetails :item="details" type="session" @close="details = null">
      <template #actions>
        <button type="button" class="tt-btn tt-btn--danger tt-btn--sm" @click="askCancel(details)">
          <i class="fa-solid fa-xmark"></i> Отменить тренировку
        </button>
      </template>
    </ScheduleDetails>

    <ConfirmDialog :open="Boolean(pending)" danger icon="fa-solid fa-calendar-xmark" title="Отменить тренировку?"
      confirm-label="Отменить" cancel-label="Оставить" :busy="cancelling" @confirm="confirmCancel"
      @cancel="closeConfirm">
      <template v-if="pending">
        <div class="tt-tile confirm-card">
          <b>{{ pending.workout_name }}</b>
          <span v-if="pending.client_names"><i class="fa-solid fa-user"></i> {{ pending.client_names }}</span>
          <span><i class="fa-regular fa-clock"></i> {{ pendingWhen }}</span>
        </div>
        <p class="confirm-line">Занятие пропадёт из расписания у вас и у клиента.</p>
        <p v-if="cancelError" class="tt-note tt-note--error confirm-error">
          <i class="fa-solid fa-circle-exclamation"></i> {{ cancelError }}
        </p>
      </template>
    </ConfirmDialog>
  </section>
</template>

<script>
import Reveal from '@/components/ui/Reveal.vue';
import SectionHead from '@/components/ui/SectionHead.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import WeekStrip from '@/components/schedule/WeekStrip.vue';
import WeekGrid from '@/components/schedule/WeekGrid.vue';
import SessionCard from '@/components/schedule/SessionCard.vue';
import ScheduleDetails from '@/components/schedule/ScheduleDetails.vue';
import {
  toDate, addDays, startOfWeek, weekDays, isSameDay, byStartTime,
  formatTime, timeToMinutes, formatDuration
} from '@/components/utils/week.js';
import { plural, capitalize } from '@/components/utils/format.js';

// Короче этого перерыв между занятиями не показываем
const MIN_GAP = 15;

// Расписание тренера: данные загружает страница (TrainerPage), здесь — показ и отмена
export default {
  name: 'TrainerSchedule',
  components: { Reveal, SectionHead, ConfirmDialog, WeekStrip, WeekGrid, SessionCard, ScheduleDetails },
  props: {
    sessions: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    error: { type: String, default: null }
  },
  data() {
    const today = new Date();
    return {
      view: 'day',
      selectedDay: today,
      weekStart: startOfWeek(today),
      details: null,
      // Тренировка, которую собираются отменить (открыт диалог)
      pending: null,
      cancelling: false,
      cancelError: null,
      notice: null
    };
  },
  computed: {
    selectedKey() {
      return this.selectedDay.toDateString();
    },
    dayTitle() {
      return capitalize(this.selectedDay.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }));
    },
    shortDay() {
      return this.selectedDay.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    },
    daySessions() {
      return this.sessionsOn(this.selectedDay);
    },
    // Занятия дня вперемешку с «окнами» между ними
    timeline() {
      const entries = [];
      this.daySessions.forEach((session, index) => {
        const previous = this.daySessions[index - 1];
        if (previous) {
          const gap = timeToMinutes(session.starttime) - timeToMinutes(previous.endtime);
          if (gap >= MIN_GAP) {
            entries.push({ type: 'gap', key: `gap-${index}`, label: `Окно ${formatDuration(gap)}` });
          } else if (gap < 0) {
            entries.push({ type: 'gap', key: `gap-${index}`, label: `Пересечение ${formatDuration(-gap)}`, warn: true });
          }
        }
        entries.push({ type: 'session', key: `s-${session.scheduleid || index}`, session, index });
      });
      return entries;
    },
    // Часы в зале: «1,5 часа», «2 часа», «5 часов»
    dayHours() {
      const minutes = this.daySessions.reduce((sum, session) => {
        const length = timeToMinutes(session.endtime) - timeToMinutes(session.starttime);
        return sum + (length > 0 ? length : 0);
      }, 0);
      const hours = Math.round((minutes / 60) * 2) / 2;
      const word = Number.isInteger(hours) ? plural(hours, ['час', 'часа', 'часов']) : 'часа';
      return { value: String(hours).replace('.', ','), word };
    },
    dayClients() {
      const names = new Set();
      this.daySessions.forEach((session) => {
        (session.client_names || '').split(', ').filter(Boolean).forEach(name => names.add(name));
      });
      return names.size;
    },
    daySpan() {
      if (!this.daySessions.length) return null;
      const ends = this.daySessions.map(session => formatTime(session.endtime)).sort();
      return { from: formatTime(this.daySessions[0].starttime), to: ends[ends.length - 1] };
    },
    weekLoad() {
      const today = new Date();
      const days = weekDays(this.weekStart).map(date => ({
        key: date.toDateString(),
        date,
        name: capitalize(date.toLocaleDateString('ru-RU', { weekday: 'short' })),
        count: this.sessionsOn(date).length,
        today: isSameDay(date, today),
        selected: isSameDay(date, this.selectedDay)
      }));
      const max = Math.max(1, ...days.map(day => day.count));
      return days.map(day => ({ ...day, share: day.count / max }));
    },
    pendingWhen() {
      if (!this.pending) return '';
      const date = toDate(this.pending.date);
      const day = isNaN(date) ? '' : capitalize(date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }));
      return `${day}, ${formatTime(this.pending.starttime)}–${formatTime(this.pending.endtime)}`;
    }
  },
  beforeDestroy() {
    clearTimeout(this.noticeTimer);
  },
  methods: {
    sessionsOn(date) {
      return this.sessions.filter(s => isSameDay(s.date, date)).sort(byStartTime);
    },
    countFor(date) {
      return { sessions: this.sessionsOn(date).length, meals: 0 };
    },
    sessionsWord(n) {
      return plural(n, ['тренировка', 'тренировки', 'тренировок']);
    },
    clientsWord(n) {
      return plural(n, ['клиент', 'клиента', 'клиентов']);
    },
    selectDay(date) {
      this.selectedDay = date;
    },
    // Листаем неделю, сохраняя выбранный день недели
    shiftWeek(direction) {
      this.weekStart = addDays(this.weekStart, direction * 7);
      this.selectedDay = addDays(this.selectedDay, direction * 7);
    },
    goToday() {
      const today = new Date();
      this.weekStart = startOfWeek(today);
      this.selectedDay = today;
    },
    openDay(date) {
      this.selectedDay = date;
      this.view = 'day';
    },
    openDetails(session) {
      this.details = session;
    },
    askCancel(session) {
      this.details = null;
      this.cancelError = null;
      this.pending = session;
    },
    closeConfirm() {
      this.pending = null;
      this.cancelError = null;
    },
    async confirmCancel() {
      const session = this.pending;
      if (!session) return;
      this.cancelling = true;
      this.cancelError = null;
      try {
        const response = await fetch(`/api/schedule/${session.scheduleid}`, { method: 'DELETE' });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Не удалось отменить тренировку');
        }
        this.$emit('cancelled', session.scheduleid);
        this.pending = null;
        this.showNotice(`Тренировка «${session.workout_name}» отменена`);
      } catch (error) {
        this.cancelError = error.message === 'Failed to fetch'
          ? 'Нет связи с сервером. Проверьте соединение.'
          : error.message;
      } finally {
        this.cancelling = false;
      }
    },
    showNotice(text) {
      this.notice = text;
      clearTimeout(this.noticeTimer);
      this.noticeTimer = setTimeout(() => { this.notice = null; }, 4000);
    }
  }
};
</script>

<style scoped>
.board {
  display: grid;
  gap: 24px;
}

/* ---------- режим дня ---------- */

.day-view {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 1fr);
  align-items: start;
  gap: 24px;
}

.column {
  display: grid;
  align-content: start;
  gap: 14px;
}

.timeline {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.skeleton {
  height: 104px;
}

.slot {
  min-width: 0;
}

/* Перерыв между занятиями: тонкая пунктирная «перемычка» с подписью */
.gap {
  position: relative;
  display: flex;
  justify-content: center;
  margin: -2px 0;
}

.gap::before {
  content: "";
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  border-top: 1.5px dashed var(--tt-line-brand);
}

.gap-pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border: 1px solid var(--tt-line-brand);
  border-radius: var(--tt-radius-pill);
  background-color: var(--tt-surface);
  color: var(--tt-muted);
  font-size: 12px;
  font-weight: 600;
}

.gap-pill i {
  color: var(--tt-blue);
}

.gap--warn::before {
  border-top-color: rgba(220, 38, 38, 0.4);
}

.gap--warn .gap-pill {
  border-color: rgba(220, 38, 38, 0.35);
  color: #b91c1c;
}

.gap--warn .gap-pill i {
  color: #dc2626;
}

.cancel-link {
  --tt-focus-ring: rgba(220, 38, 38, 0.35);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  margin: 0;
  padding: 0 12px;
  border: 1px solid rgba(220, 38, 38, 0.24);
  border-radius: var(--tt-radius-pill);
  background-color: transparent;
  color: #b91c1c;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.cancel-link:hover {
  border-color: #dc2626;
  background-color: #dc2626;
  color: #ffffff;
}

body.dark-theme .cancel-link {
  color: #fca5a5;
}

body.dark-theme .cancel-link:hover {
  color: #ffffff;
}

.tt-empty .tt-btn {
  margin-top: 6px;
}

/* ---------- сводка дня ---------- */

.summary {
  position: sticky;
  top: 96px;
  display: grid;
  gap: 18px;
  padding: 22px;
  border-radius: var(--tt-radius-lg);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

/* Плитки внутри сводки — на белом, сама сводка на мягком фоне */
.stat {
  display: grid;
  gap: 2px;
  padding: 12px;
  background-color: var(--tt-surface);
  text-align: center;
}

.stat b {
  color: var(--tt-ink);
  font-size: 26px;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.stat span {
  color: var(--tt-muted);
  font-size: 12px;
  line-height: 1.3;
}

.stat:first-child b {
  color: var(--tt-brand);
}

.span-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: -6px 0 0;
  color: var(--tt-soft);
  font-size: 14px;
  font-weight: 500;
}

.span-line i {
  color: var(--tt-blue);
}

.load {
  display: grid;
  gap: 10px;
}

.load-label {
  color: var(--tt-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.bars {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
}

.bar {
  display: grid;
  justify-items: center;
  gap: 6px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: var(--tt-radius-sm);
  background: transparent;
  color: var(--tt-muted);
  cursor: pointer;
}

.bar-count {
  min-height: 16px;
  color: var(--tt-ink);
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
}

.bar-track {
  position: relative;
  display: block;
  width: 100%;
  max-width: 26px;
  height: 72px;
  overflow: hidden;
  border-radius: var(--tt-radius-xs);
  background-color: var(--tt-brand-tint);
}

/* Столбик растёт снизу; при смене недели высота плавно перетекает */
.bar-fill {
  position: absolute;
  inset: 0;
  border-radius: var(--tt-radius-xs);
  background: linear-gradient(180deg, #ffb48a 0%, #f8500a 100%);
  transform: scaleY(var(--h, 0));
  transform-origin: 50% 100%;
  transition: transform 0.6s var(--tt-ease);
}

.bar-name {
  font-size: 12px;
  font-weight: 600;
}

.bar.is-today .bar-name {
  color: var(--tt-blue-deep);
}

.bar.is-selected .bar-track {
  box-shadow: 0 0 0 2px var(--tt-brand);
}

.bar.is-selected .bar-name {
  color: var(--tt-brand-deep);
}

.bar:hover .bar-track {
  box-shadow: 0 0 0 2px var(--tt-line-brand);
}

.bar.is-selected:hover .bar-track {
  box-shadow: 0 0 0 2px var(--tt-brand);
}

.plan-btn {
  width: 100%;
}

/* ---------- диалог отмены ---------- */

.confirm-card {
  display: grid;
  gap: 6px;
  margin: 0 0 14px;
  padding: 14px 16px;
  text-align: left;
}

.confirm-card b {
  color: var(--tt-ink);
  font-size: 16px;
}

.confirm-card span {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--tt-soft);
  font-size: 14px;
}

.confirm-card i {
  width: 14px;
  color: var(--tt-brand);
  font-size: 12px;
  text-align: center;
}

.confirm-line {
  margin: 0;
}

.confirm-error {
  margin: 14px 0 0;
  text-align: left;
}

@media (max-width: 900px) {
  .day-view {
    grid-template-columns: minmax(0, 1fr);
  }

  .summary {
    position: static;
  }
}

@media (max-width: 640px) {
  .summary {
    padding: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bar-fill {
    transition: none;
  }
}
</style>
