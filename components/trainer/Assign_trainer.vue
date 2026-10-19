<template>
  <section id="assign" class="tt-container" aria-labelledby="assign-title">
    <SectionHead eyebrow="Назначение" icon="fa-solid fa-calendar-plus" title-id="assign-title"
      lead="Выберите клиента, программу и время — занятие сразу появится в расписании у вас и у клиента.">
      Назначить <span class="tt-accent">тренировку</span>
    </SectionHead>

    <Reveal class="tt-board" :y="16" :amount="0.1">
      <form class="assign" novalidate @submit.prevent="submit">
        <div class="assign-form">
          <!-- 1. Клиент -->
          <fieldset class="step">
            <legend class="step-title"><span class="step-num">1</span> Клиент</legend>

            <div v-if="loadingLists" class="clients">
              <span v-for="n in 4" :key="n" class="tt-skeleton chip-skeleton"></span>
            </div>
            <div v-else-if="!clients.length" class="tt-empty">
              <i class="fa-solid fa-user-plus"></i>
              Клиентов пока нет — они появятся, когда выберут вас тренером
            </div>
            <template v-else>
              <label v-if="clients.length > 8" class="tt-search search">
                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                <input v-model.trim="clientQuery" type="search" placeholder="Найти клиента" aria-label="Поиск клиента" />
              </label>
              <div class="clients" role="radiogroup" aria-label="Клиент">
                <label v-for="client in filteredClients" :key="client.clientid"
                  :class="['client', { checked: form.client_id === client.clientid }]">
                  <input v-model="form.client_id" type="radio" name="assign-client" :value="client.clientid" />
                  <span class="tt-avatar tt-avatar--blue">{{ initialsOf(client.first_name, client.last_name) }}</span>
                  <span class="client-name">{{ joinName(client.first_name, client.last_name) }}</span>
                  <i class="fa-solid fa-check client-check" aria-hidden="true"></i>
                </label>
                <p v-if="!filteredClients.length" class="nothing">Никого не нашли</p>
              </div>
            </template>
          </fieldset>

          <!-- 2. Программа -->
          <fieldset class="step">
            <legend class="step-title"><span class="step-num">2</span> Программа</legend>
            <select v-model="form.workout_id" class="tt-input" :disabled="loadingLists || !workouts.length"
              aria-label="Программа тренировки">
              <option disabled value="">{{ workoutsPlaceholder }}</option>
              <option v-for="workout in workouts" :key="workout.workoutid" :value="workout.workoutid">
                {{ workout.name }}
              </option>
            </select>
            <transition name="tt-swap">
              <div v-if="selectedWorkout" :key="selectedWorkout.workoutid" class="workout-meta">
                <span v-if="selectedWorkout.workout_type" class="tt-chip">{{ selectedWorkout.workout_type }}</span>
                <span v-if="selectedWorkout.difficulty" class="tt-chip tt-chip--blue">{{ selectedWorkout.difficulty }}</span>
                <span v-if="workoutMinutes" class="tt-chip tt-chip--muted">
                  <i class="fa-regular fa-clock"></i> {{ workoutMinutes }} мин
                </span>
                <p v-if="selectedWorkout.description" class="workout-text">{{ selectedWorkout.description }}</p>
              </div>
            </transition>
          </fieldset>

          <!-- 3. Когда и где -->
          <fieldset class="step">
            <legend class="step-title"><span class="step-num">3</span> Когда и где</legend>
            <div class="when">
              <label class="tt-field date">
                <span class="tt-field-label">Дата</span>
                <input v-model="form.date" class="tt-input" type="date" required />
              </label>
              <label class="tt-field">
                <span class="tt-field-label">Начало</span>
                <input v-model="form.start_time" class="tt-input" type="time" required />
              </label>
              <label class="tt-field">
                <span class="tt-field-label">Конец</span>
                <input v-model="form.end_time" :class="['tt-input', { invalid: timeInvalid }]" type="time" required
                  @input="duration = null" />
              </label>
            </div>

            <div class="durations" role="group" aria-label="Длительность">
              <span class="durations-label">Длительность</span>
              <button v-for="option in durationOptions" :key="option.minutes" type="button"
                :class="['duration', { 'is-active': duration === option.minutes }]" :disabled="!form.start_time"
                :title="form.start_time ? '' : 'Сначала укажите начало'" @click="setDuration(option.minutes)">
                {{ option.label }}
              </button>
            </div>

            <label class="tt-field place">
              <span class="tt-field-label">Место</span>
              <input v-model.trim="form.location" class="tt-input" type="text" list="assign-locations"
                placeholder="Зал, корпус, онлайн…" required />
              <datalist id="assign-locations">
                <option v-for="place in knownLocations" :key="place" :value="place" />
              </datalist>
            </label>
          </fieldset>
        </div>

        <!-- Предпросмотр: «билет» на занятие -->
        <div class="assign-side">
          <div :class="['tt-dark', 'ticket', `ticket--${status.key}`]">
            <div class="ticket-top">
              <div class="ticket-head">
                <span class="ticket-label">Предпросмотр</span>
                <span class="ticket-status" aria-live="polite"><span class="status-dot"></span>{{ status.label }}</span>
              </div>
              <!-- key пересоздаёт строку при смене значения, и она заново «всплывает» -->
              <p :key="dateLabel" class="ticket-date ticket-pop">{{ dateLabel || 'Дата не выбрана' }}</p>
              <p :key="timeLabel" class="ticket-time ticket-pop">
                <template v-if="form.start_time">
                  {{ form.start_time }}<span class="dash">–</span>{{ form.end_time || '…' }}
                </template>
                <span v-else class="time-empty">--:--</span>
              </p>
              <span v-if="lengthLabel" class="ticket-length">{{ lengthLabel }}</span>
            </div>

            <div class="ticket-cut" aria-hidden="true"></div>

            <div class="ticket-bottom">
              <div v-for="row in ticketRows" :key="row.key" class="t-row">
                <span class="tt-icon-tile tt-icon-tile--sm tt-icon-tile--glass"><i :class="row.icon"></i></span>
                <span class="t-text">
                  <span class="t-label">{{ row.label }}</span>
                  <span :class="['t-value', { 't-value--empty': !row.value }]">{{ row.value || row.empty }}</span>
                </span>
              </div>
            </div>

            <div class="ticket-day">
              <span class="t-label">В этот день у вас</span>
              <div v-if="dayList.length" class="day-chips">
                <span v-for="(session, index) in dayList" :key="session.scheduleid || index"
                  :class="['day-chip', { 'day-chip--clash': session.clash }]">
                  {{ time(session.starttime) }}–{{ time(session.endtime) }} · {{ session.workout_name }}
                </span>
              </div>
              <span v-else class="t-value t-value--empty">{{ form.date ? 'свободно' : '—' }}</span>
            </div>
          </div>

          <p v-if="problem" class="tt-note tt-note--error" role="alert">
            <i class="fa-solid fa-triangle-exclamation"></i> {{ problem }}
          </p>

          <button type="submit" class="tt-btn tt-btn--primary submit" :disabled="submitting || !ready">
            <i v-if="submitting" class="fa-solid fa-spinner fa-spin"></i>
            {{ submitting ? 'Назначаю…' : 'Назначить тренировку' }}
            <span v-if="!submitting" class="tt-arrow" aria-hidden="true">→</span>
          </button>
          <p v-if="missingLabel" class="missing">Осталось указать: {{ missingLabel }}</p>

          <transition name="tt-swap">
            <p v-if="success" class="tt-note tt-note--ok" role="status">
              <i class="fa-solid fa-circle-check"></i> {{ success }}
            </p>
          </transition>
          <p v-if="error" class="tt-note tt-note--error" role="alert">
            <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
          </p>
        </div>
      </form>
    </Reveal>
  </section>
</template>

<script>
import Reveal from '@/components/ui/Reveal.vue';
import SectionHead from '@/components/ui/SectionHead.vue';
import {
  toDate, isSameDay, byStartTime, formatTime, timeToMinutes, minutesToTime, formatDuration
} from '@/components/utils/week.js';
import { capitalize, joinName, initialsOf } from '@/components/utils/format.js';

const BASE_DURATIONS = [45, 60, 90];

// Длительность программы в базе — interval: драйвер отдаёт { hours, minutes },
// в старых записях встречается строка «55 minutes» или «01:00:00»
const toMinutes = (value) => {
  if (!value) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'object') {
    const { days = 0, hours = 0, minutes = 0 } = value;
    return days * 1440 + hours * 60 + minutes || null;
  }
  const clock = String(value).match(/^(\d+):(\d+)/);
  if (clock) return Number(clock[1]) * 60 + Number(clock[2]);
  const number = String(value).match(/\d+/);
  return number ? Number(number[0]) : null;
};

const emptyForm = (keep = {}) => ({
  client_id: '',
  workout_id: '',
  date: keep.date || '',
  start_time: '',
  end_time: '',
  location: keep.location || ''
});

export default {
  name: 'AssignTraining',
  components: { Reveal, SectionHead },
  props: {
    coachId: { type: [Number, String], default: null },
    // Уже назначенные занятия тренера — для проверки пересечений
    sessions: { type: Array, default: () => [] },
    // { date: '2026-10-12', at: время клика } — день, выбранный в расписании
    plan: { type: Object, default: null }
  },
  data() {
    return {
      clients: [],
      workouts: [],
      loadingLists: false,
      clientQuery: '',
      form: emptyForm(),
      // Выбранная длительность: конец пересчитывается при смене начала
      duration: null,
      submitting: false,
      success: null,
      error: null
    };
  },
  computed: {
    filteredClients() {
      const query = this.clientQuery.toLowerCase();
      if (!query) return this.clients;
      return this.clients.filter(client => this.fullName(client).toLowerCase().includes(query));
    },
    selectedClient() {
      return this.clients.find(client => client.clientid === this.form.client_id) || null;
    },
    selectedWorkout() {
      return this.workouts.find(workout => workout.workoutid === this.form.workout_id) || null;
    },
    workoutMinutes() {
      return this.selectedWorkout ? toMinutes(this.selectedWorkout.duration) : null;
    },
    workoutsPlaceholder() {
      if (this.loadingLists) return 'Загружаю программы…';
      return this.workouts.length ? 'Выберите тренировку' : 'Программ пока нет';
    },
    durationOptions() {
      const minutes = [...BASE_DURATIONS];
      if (this.workoutMinutes && !minutes.includes(this.workoutMinutes)) minutes.unshift(this.workoutMinutes);
      return minutes.map(value => ({ minutes: value, label: this.durationLabel(value) }));
    },
    knownLocations() {
      return [...new Set(this.sessions.map(session => session.location).filter(Boolean))].slice(0, 12);
    },
    startMinutes() {
      return timeToMinutes(this.form.start_time);
    },
    endMinutes() {
      return timeToMinutes(this.form.end_time);
    },
    timeInvalid() {
      return this.startMinutes !== null && this.endMinutes !== null && this.endMinutes <= this.startMinutes;
    },
    dateLabel() {
      if (!this.form.date) return '';
      const date = toDate(this.form.date);
      return isNaN(date) ? '' : capitalize(date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }));
    },
    timeLabel() {
      return `${this.form.start_time}-${this.form.end_time}`;
    },
    lengthLabel() {
      if (this.timeInvalid || this.startMinutes === null || this.endMinutes === null) return '';
      return formatDuration(this.endMinutes - this.startMinutes);
    },
    // Пересечения считаем так же, как сервер (границы включительно),
    // чтобы предупреждение совпадало с его отказом
    clashes() {
      if (!this.form.date || this.startMinutes === null || this.endMinutes === null || this.timeInvalid) return [];
      const start = this.startMinutes;
      const end = this.endMinutes;
      return this.sessions.filter((session) => {
        if (!isSameDay(session.date, this.form.date)) return false;
        const from = timeToMinutes(session.starttime);
        const to = timeToMinutes(session.endtime);
        return (from >= start && from <= end) || (to >= start && to <= end) || (from <= start && to >= end);
      });
    },
    dayList() {
      if (!this.form.date) return [];
      return this.sessions
        .filter(session => isSameDay(session.date, this.form.date))
        .sort(byStartTime)
        .map(session => ({ ...session, clash: this.clashes.includes(session) }));
    },
    missing() {
      const labels = [];
      if (!this.form.client_id) labels.push('клиента');
      if (!this.form.workout_id) labels.push('программу');
      if (!this.form.date) labels.push('дату');
      if (!this.form.start_time || !this.form.end_time) labels.push('время');
      if (!this.form.location) labels.push('место');
      return labels;
    },
    missingLabel() {
      return this.missing.join(', ');
    },
    problem() {
      if (this.timeInvalid) return 'Окончание должно быть позже начала.';
      if (this.clashes.length) {
        const first = this.clashes[0];
        return `В это время уже есть «${first.workout_name}» (${formatTime(first.starttime)}–${formatTime(first.endtime)}). `
          + 'Занятия не могут пересекаться или идти встык.';
      }
      return '';
    },
    ready() {
      return !this.missing.length && !this.problem && Boolean(this.coachId);
    },
    status() {
      if (this.problem) return { key: 'warn', label: this.timeInvalid ? 'Проверьте время' : 'Пересечение' };
      if (this.ready) return { key: 'ready', label: 'Готово' };
      return { key: 'draft', label: 'Черновик' };
    },
    ticketRows() {
      return [
        {
          key: 'client', icon: 'fa-solid fa-user', label: 'Клиент', empty: 'не выбран',
          value: this.selectedClient ? this.fullName(this.selectedClient) : ''
        },
        {
          key: 'workout', icon: 'fa-solid fa-dumbbell', label: 'Программа', empty: 'не выбрана',
          value: this.selectedWorkout ? this.selectedWorkout.name : ''
        },
        { key: 'place', icon: 'fa-solid fa-location-dot', label: 'Место', empty: 'не указано', value: this.form.location }
      ];
    }
  },
  watch: {
    coachId: {
      immediate: true,
      handler(id) {
        if (id) this.loadLists();
      }
    },
    // День выбрали в расписании — подставляем его в форму
    plan(value) {
      if (!value || !value.date) return;
      this.form.date = value.date;
      this.success = null;
    },
    'form.start_time'() {
      if (this.duration) this.applyDuration();
    },
    // У программы есть длительность — сразу предлагаем её
    'form.workout_id'() {
      if (!this.workoutMinutes) return;
      if (this.form.end_time && this.duration === null) return; // конец уже введён вручную
      this.setDuration(this.workoutMinutes);
    }
  },
  beforeDestroy() {
    clearTimeout(this.successTimer);
  },
  methods: {
    time: formatTime,
    joinName,
    initialsOf,
    fullName(client) {
      return joinName(client.first_name, client.last_name);
    },
    durationLabel(minutes) {
      if (minutes % 60 === 0) return `${minutes / 60} ч`;
      if (minutes > 60 && minutes % 30 === 0) return `${String(minutes / 60).replace('.', ',')} ч`;
      return `${minutes} мин`;
    },
    setDuration(minutes) {
      this.duration = minutes;
      this.applyDuration();
    },
    applyDuration() {
      if (this.startMinutes === null) return;
      this.form.end_time = minutesToTime(this.startMinutes + this.duration);
    },
    async loadLists() {
      this.loadingLists = true;
      this.error = null;
      try {
        const [clientsRes, workoutsRes] = await Promise.all([
          fetch(`/api/coaches/${this.coachId}/clients`),
          fetch(`/api/coaches/${this.coachId}/workouts`)
        ]);
        if (clientsRes.status === 401 || workoutsRes.status === 401) {
          throw new Error('Сессия истекла — войдите заново.');
        }
        if (!clientsRes.ok || !workoutsRes.ok) throw new Error('Не удалось загрузить клиентов и программы.');
        const [clients, workouts] = await Promise.all([clientsRes.json(), workoutsRes.json()]);
        this.clients = Array.isArray(clients) ? clients : [];
        this.workouts = Array.isArray(workouts) ? workouts : [];
      } catch (error) {
        console.error('Ошибка загрузки данных для назначения:', error);
        this.error = error.message === 'Failed to fetch'
          ? 'Нет связи с сервером. Проверьте соединение.'
          : error.message;
      } finally {
        this.loadingLists = false;
      }
    },
    async submit() {
      if (!this.ready || this.submitting) return;
      this.submitting = true;
      this.error = null;
      this.success = null;

      // Имена не склоняем, поэтому фраза построена без падежей: «Программа» — Имя, дата
      const summary = `«${this.selectedWorkout.name}» — ${this.fullName(this.selectedClient)}, `
        + `${this.dateLabel.toLowerCase()}, ${this.form.start_time}–${this.form.end_time}`;
      try {
        const response = await fetch(`/api/coaches/${this.coachId}/assign-training`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Не удалось назначить тренировку');

        this.$emit('assigned');
        // Дату и место оставляем: часто назначают несколько занятий подряд
        this.form = emptyForm(this.form);
        this.duration = null;
        this.success = `Назначено: ${summary}`;
        clearTimeout(this.successTimer);
        this.successTimer = setTimeout(() => { this.success = null; }, 6000);
      } catch (error) {
        console.error('Ошибка назначения тренировки:', error);
        this.error = error.message === 'Failed to fetch'
          ? 'Нет связи с сервером. Проверьте соединение.'
          : error.message;
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>

<style scoped>
.assign {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(300px, 1fr);
  align-items: start;
  gap: 36px;
}

.assign-form {
  display: grid;
  gap: 28px;
  min-width: 0;
}

/* ---------- шаги формы ---------- */

.step {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.step-title {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin: 0 0 14px;
  padding: 0;
  color: var(--tt-ink);
  font-size: 17px;
  font-weight: 700;
}

.step-num {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: var(--tt-brand-tint);
  color: var(--tt-brand-deep);
  font-size: 13px;
  font-weight: 700;
}

.search {
  margin-bottom: 12px;
}

.clients {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 236px;
  padding: 2px;
  overflow-y: auto;
}

.chip-skeleton {
  width: 168px;
  height: 46px;
  border-radius: var(--tt-radius-pill);
}

.client {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 6px 16px 6px 6px;
  border: 1.5px solid var(--tt-field);
  border-radius: var(--tt-radius-pill);
  background-color: var(--tt-bg-soft);
  color: var(--tt-soft);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.3s var(--tt-ease);
}

.client:hover {
  border-color: rgba(248, 80, 10, 0.5);
  color: var(--tt-ink);
  transform: translateY(-2px);
}

.client input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.client .tt-avatar {
  width: 32px;
  height: 32px;
  font-size: 12px;
}

.client-check {
  width: 0;
  overflow: hidden;
  color: var(--tt-brand);
  font-size: 12px;
  opacity: 0;
  transform: scale(0.4);
  transition: width 0.25s var(--tt-ease), opacity 0.2s ease, transform 0.3s var(--tt-ease);
}

.client.checked {
  border-color: var(--tt-brand);
  background-color: var(--tt-brand-50);
  color: var(--tt-brand-deep);
}

.client.checked .tt-avatar {
  background: var(--tt-gradient-brand);
}

.client.checked .client-check {
  width: 12px;
  opacity: 1;
  transform: none;
}

.client:focus-within {
  box-shadow: 0 0 0 4px rgba(248, 80, 10, 0.16);
}

.nothing {
  margin: 6px 4px;
  color: var(--tt-muted);
  font-size: 14px;
}

.workout-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
}

.workout-text {
  flex-basis: 100%;
  margin: 4px 0 0;
  color: var(--tt-soft);
  font-size: 14px;
  line-height: 1.55;
}

.when {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.when .tt-field {
  margin: 0;
}

.durations {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
}

.durations-label {
  margin-right: 4px;
  color: var(--tt-muted);
  font-size: 13px;
  font-weight: 600;
}

.duration {
  height: 32px;
  margin: 0;
  padding: 0 12px;
  border: 1px solid var(--tt-line-brand);
  border-radius: var(--tt-radius-pill);
  background-color: var(--tt-surface);
  color: var(--tt-soft);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.duration:hover:not(:disabled) {
  border-color: var(--tt-brand);
  color: var(--tt-brand-deep);
}

.duration.is-active {
  border-color: transparent;
  background: var(--tt-gradient-brand);
  color: #ffffff;
}

.duration:disabled {
  cursor: default;
  opacity: 0.5;
}

.place {
  margin: 16px 0 0;
}

/* ---------- предпросмотр ---------- */

.assign-side {
  position: sticky;
  top: 96px;
  display: grid;
  gap: 14px;
}

/* Основа — .tt-dark. Билет — карточка внутри панели, поэтому радиус как у карточки,
   а свечение своё (::before): оно разгорается, когда форма заполнена */
.ticket {
  border-radius: var(--tt-radius-lg);
  background: var(--tt-gradient-navy);
  transition: box-shadow 0.4s ease;
}

/* Оранжевое свечение в углу — ярче, когда всё заполнено */
.ticket::before {
  content: "";
  position: absolute;
  top: -90px;
  right: -70px;
  z-index: -1;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(248, 80, 10, 0.5) 0%, rgba(248, 80, 10, 0) 70%);
  opacity: 0.55;
  transition: opacity 0.5s ease;
}

.ticket--ready {
  box-shadow: 0 30px 60px -30px rgba(248, 80, 10, 0.6), 0 0 0 1.5px rgba(255, 122, 61, 0.6);
}

.ticket--ready::before {
  opacity: 1;
}

.ticket--warn {
  box-shadow: 0 30px 60px -30px rgba(11, 16, 32, 0.6), 0 0 0 1.5px rgba(248, 113, 113, 0.55);
}

.ticket-top {
  padding: 22px 24px 20px;
}

.ticket-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ticket-label,
.t-label {
  color: rgba(255, 255, 255, 0.55);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ticket-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: var(--tt-radius-pill);
  background-color: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  font-weight: 600;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.45);
}

.ticket--ready .status-dot {
  background-color: #34d399;
  animation: ready-pulse 1.6s ease-out infinite;
}

.ticket--warn .status-dot {
  background-color: #f87171;
}

@keyframes ready-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.6);
  }

  100% {
    box-shadow: 0 0 0 8px rgba(52, 211, 153, 0);
  }
}

.ticket-date {
  margin: 18px 0 4px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 15px;
  font-weight: 600;
}

.ticket-time {
  margin: 0;
  font-size: 44px;
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.ticket-time .dash {
  margin: 0 6px;
  color: #ff7a3d;
}

.ticket-length {
  display: inline-block;
  margin-top: 10px;
  padding: 3px 10px;
  border-radius: var(--tt-radius-pill);
  background-color: rgba(248, 80, 10, 0.22);
  color: #ffb48a;
  font-size: 12px;
  font-weight: 700;
}

/* Линия отрыва с полукруглыми вырезами по краям */
.ticket-cut {
  position: relative;
  margin: 0 22px;
  border-top: 2px dashed rgba(255, 255, 255, 0.16);
}

.ticket-cut::before,
.ticket-cut::after {
  content: "";
  position: absolute;
  top: -13px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: var(--tt-surface);
}

.ticket-cut::before {
  left: -36px;
}

.ticket-cut::after {
  right: -36px;
}

.ticket-bottom {
  display: grid;
  gap: 14px;
  padding: 20px 24px 6px;
}

.t-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.t-text {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.t-value {
  overflow: hidden;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.t-value--empty {
  color: rgba(255, 255, 255, 0.45);
  font-weight: 500;
  font-style: italic;
}

.ticket-day {
  display: grid;
  gap: 8px;
  margin: 14px 24px 22px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.day-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.day-chip {
  padding: 4px 10px;
  border-radius: var(--tt-radius-pill);
  background-color: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  font-weight: 600;
}

.day-chip--clash {
  background-color: rgba(248, 113, 113, 0.18);
  box-shadow: inset 0 0 0 1px rgba(248, 113, 113, 0.55);
  color: #fecaca;
}

.time-empty {
  color: rgba(255, 255, 255, 0.3);
}

/* Новое значение в билете мягко всплывает */
.ticket-pop {
  animation: ticket-pop 0.35s var(--tt-ease) both;
}

@keyframes ticket-pop {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

.submit {
  width: 100%;
}

.missing {
  margin: -4px 0 0;
  color: var(--tt-muted);
  font-size: 13px;
  text-align: center;
}

@media (max-width: 900px) {
  .assign {
    grid-template-columns: minmax(0, 1fr);
    gap: 28px;
  }

  .assign-side {
    position: static;
  }
}

@media (max-width: 560px) {
  .when {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .when .date {
    grid-column: 1 / -1;
  }

  .ticket-time {
    font-size: 36px;
  }
}

@media (prefers-reduced-motion: reduce) {

  .client,
  .client-check {
    transition: none;
  }

  .ticket-pop {
    animation: none;
  }

  .client:hover {
    transform: none;
  }

  .ticket--ready .status-dot {
    animation: none;
  }
}
</style>
