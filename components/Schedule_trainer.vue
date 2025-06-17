<template>
  <div class="schedule">
    <h1 id="schedule" class="title">РАСПИСАНИЕ</h1>

    <div class="view-toggle">
      <button class="toggle-button" @click="showWeekView = !showWeekView">
        {{ showWeekView ? 'Режим дня' : 'Режим недели' }}
      </button>
    </div>

    <div class="date-picker">
      <button class="arrow-button" @click="prevWeek">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <div class="dates">
        <div v-for="(day, index) in currentWeek" :key="index"
          :class="['date', { active: isSelected(day.date), today: isToday(day.date) }]" @click="selectDay(day)">
          <p class="day-number">{{ day.date.getDate() }}</p>
          <p class="day-name">{{ getDayName(day.date) }}</p>
        </div>
      </div>
      <button class="arrow-button" @click="nextWeek">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>

    <!-- Режим недели -->
    <div v-if="showWeekView" class="week-view">
      <div v-for="(day, index) in currentWeek" :key="index" class="day-column">
        <h3 class="day-header">
          {{ day.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' }) }}
        </h3>

        <div v-for="(session, i) in getSessionsByDateSorted(day.date)" :key="'s' + i" class="session-box"
          @click="openDetails(session)">
          <strong>{{ session.workout_name }}</strong>
          <div class="session-time">{{ formatTime(session.starttime) }} - {{ formatTime(session.endtime) }}</div>
          <div class="session-footer">
            <button class="cancel-button" @click.stop="cancelSession(session.scheduleid)">Отменить</button>
          </div>
        </div>

        <div v-if="getSessionsByDate(day.date).length === 0" class="no-sessions">
          Нет данных
        </div>
      </div>
    </div>

    <!-- Режим дня -->
    <div v-else class="training-list">
      <div v-for="(session, index) in filteredTrainingSessionsSorted" :key="index" class="session-wrapper">
        <div class="bullet-line-wrapper">
          <div class="bullet"></div>
          <div class="line" v-if="index < filteredTrainingSessions.length - 1"></div>
        </div>
        <div class="session">
          <div class="session-header">
            <h2 class="session-title">{{ session.workout_name }}</h2>
            <p class="session-time">{{ formatTime(session.starttime) }} - {{ formatTime(session.endtime) }}</p>
          </div>

          <div class="session-info">
            <div class="session-details">
              <ul class="session-description">
                <li>Место: {{ session.location }}</li>
                <li>Описание: {{ session.workout_description }}</li>
              </ul>
              <h3>Упражнения:</h3>
              <ul class="exercises-list">
                <li>
                  <strong>{{ session.exercise_name }}</strong>: {{ session.exercise_description }}
                  (Оборудование: {{ session.equipment }})
                </li>
              </ul>
            </div>
          </div>

          <div class="session-footer">
            <button class="cancel-button" @click="cancelSession(session.scheduleid)">Отменить</button>
          </div>
        </div>
      </div>
      <div v-if="filteredTrainingSessions.length === 0 && !error" class="no-sessions">
        Нет запланированных тренировок на этот день.
      </div>
      <div v-if="error" class="error-message">{{ error }}</div>
    </div>

    <!-- Модальное окно -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeDetails">
      <div class="modal-content">
        <button class="close-button" @click="closeDetails">✖</button>
        <div>
          <h2>Тренировка: {{ selectedItem.workout_name }}</h2>
          <p><strong>Описание:</strong> {{ selectedItem.workout_description }}</p>
          <p><strong>Место:</strong> {{ selectedItem.location }}</p>
          <p><strong>Упражнение:</strong> {{ selectedItem.exercise_name }} — {{ selectedItem.exercise_description }}</p>
          <p><strong>Оборудование:</strong> {{ selectedItem.equipment }}</p>
          <p><strong>Время:</strong> {{ formatTime(selectedItem.starttime) }} - {{ formatTime(selectedItem.endtime) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    user: { type: Object, default: () => null }
  },
  data() {
    return {
      selectedDay: null,
      currentWeekIndex: 0,
      year: [],
      trainingSessions: [],
      showWeekView: false,
      error: null,
      showModal: false,
      selectedItem: null
    }
  },
  computed: {
    currentWeek() {
      const start = this.currentWeekIndex * 7;
      return this.year.slice(start, start + 7);
    },
    filteredTrainingSessions() {
      if (!this.selectedDay) return [];
      return this.trainingSessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.toDateString() === this.selectedDay.toDateString();
      });
    },
    filteredTrainingSessionsSorted() {
      return this.filteredTrainingSessions.slice().sort((a, b) => a.starttime.localeCompare(b.starttime));
    }
  },
  methods: {
    getSessionsByDate(date) {
      return this.trainingSessions.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate.toDateString() === date.toDateString();
      });
    },
    getSessionsByDateSorted(date) {
      return this.getSessionsByDate(date).sort((a, b) => a.starttime.localeCompare(b.starttime));
    },
    async fetchSchedule() {
      try {
        const coachId = this.user.coachid;
        const response = await fetch(`http://26.100.29.243:3000/api/schedule/${coachId}`);
        const data = await response.json();
        this.trainingSessions = Array.isArray(data) ? data : [];
      } catch (e) {
        this.error = 'Ошибка загрузки данных.';
        this.trainingSessions = [];
      }
    },
    async cancelSession(scheduleId) {
      if (!confirm('Вы уверены, что хотите отменить тренировку?')) return;
      try {
        await fetch(`http://26.100.29.243:3000/api/schedule/${scheduleId}`, { method: 'DELETE' });
        this.trainingSessions = this.trainingSessions.filter(s => s.scheduleid !== scheduleId);
      } catch (e) {
        alert('Ошибка при удалении тренировки.');
      }
    },
    generateYear(startDate) {
      const year = [];

      // Определяем 1 января текущего года
      let current = new Date(startDate.getFullYear(), 0, 1);

      // Смещаем current назад до понедельника
      const dayOfWeek = current.getDay(); // 0 — воскресенье, 1 — понедельник, ..., 6 — суббота
      const shift = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // если воскресенье, откат на -6, иначе до понедельника
      current.setDate(current.getDate() + shift);

      // Генерируем даты на год + запас на неполные недели
      while (year.length < 370) {
        year.push({ date: new Date(current) });
        current.setDate(current.getDate() + 1);
      }

      return year;
    },
    selectDay(day) {
      this.selectedDay = day.date;
    },
    isToday(date) {
      const today = new Date();
      return date.toDateString() === today.toDateString();
    },
    isSelected(date) {
      return this.selectedDay && date.toDateString() === this.selectedDay.toDateString();
    },
    formatTime(time) {
      return time?.slice?.(0, 5) || '';
    },
    prevWeek() {
      if (this.currentWeekIndex > 0) {
        this.currentWeekIndex--;
        this.selectDay(this.currentWeek[0]);
      }
    },
    nextWeek() {
      if (this.currentWeekIndex < Math.floor(this.year.length / 7)) {
        this.currentWeekIndex++;
        this.selectDay(this.currentWeek[0]);
      }
    },
    getDayName(date) {
      return date.toLocaleDateString('ru-RU', { weekday: 'short' });
    },
    openDetails(item) {
      this.selectedItem = item;
      this.showModal = true;
    },
    closeDetails() {
      this.selectedItem = null;
      this.showModal = false;
    }
  },
  created() {
    const today = new Date();
    this.selectedDay = today;
    this.year = this.generateYear(today);

    // Пересчёт индекса недели с учётом начала с понедельника
    const firstDay = this.year[0].date;
    const diffDays = Math.floor((today - firstDay) / (24 * 60 * 60 * 1000));
    this.currentWeekIndex = Math.floor(diffDays / 7);

    if (this.user && this.user.coachid) this.fetchSchedule();
  }
}
</script>

<style scoped>
.schedule {
  background-color: var(--background-color);
  padding: 20px;
  border-radius: 8px;
  color: var(--text-color);
  font-family: Arial, sans-serif;
  width: 90%;
  margin: 0 auto;
  transition: background-color 0.5s, color 0.5s;
}

.title {
  text-align: center;
  margin-bottom: 20px;
  color: var(--text-color);
  transition: color 0.5s;
}

.date-picker {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.arrow-button {
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 24px;
  cursor: pointer;
  transition: color 0.3s;
}

.dates {
  display: flex;
  justify-content: space-between;
  width: 70%;
  margin: 0 10px;
  cursor: pointer;
}

.date {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  color: var(--text-color);
  border: 2px solid transparent;
  border-radius: 20px;
  transition: border-color 0.3s, color 0.3s;
}

.date.active {
  border-color: var(--button-hover-color);
}

.day-number {
  font-size: 24px;
  margin-bottom: 5px;
}

.day-name {
  font-size: 16px;
}

.toggle-button {
  background-color: var(--button-hover-color);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.training-list {
  margin-top: 20px;
}

.session-wrapper {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  position: relative;
}

.bullet-line-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20px;
  position: relative;
  min-height: 100px;
  margin-top: 30px;
}

.bullet {
  width: 10px;
  height: 10px;
  background-color: var(--button-hover-color);
  border-radius: 50%;
  z-index: 1;
}

.line {
  width: 4px;
  background-color: var(--text-color);
  position: absolute;
  top: 25%;
  bottom: -90%;
  border-radius: 50px;
  height: 70px;
}

.nutrition-list {
  margin-top: 20px;
}

.meal-wrapper {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  position: relative;
  max-height: 100px;
}

.meal {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color-white);
  padding: 15px;
  border-radius: 10px;
  color: var(--text-color);
  transition: background-color 0.5s, color 0.5s;
}

.meal-title {
  font-size: 20px;
  margin-bottom: 5px;
}

.meal-wrapper .bullet-line-wrapper {
  margin-right: 20px;
  position: relative;
  min-height: 100px;
  margin-top: 30px;
}

.meal-wrapper .bullet {
  background-color: var(--button-hover-color);
}

.session {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color-white);
  padding: 15px;
  border-radius: 10px;
  transition: background-color 0.5s, color 0.5s;
  gap: 10px;
}

.session-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.session-details {
  margin-left: 10px;
}

.session-title {
  font-size: 24px;
  margin-bottom: 10px;
}

.session-description {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
  font-size: 18px;
  margin-bottom: 10px;
}

.exercises-list {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
  font-size: 14px;
  margin-bottom: 10px;
}

.session-time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 20px;
  margin-top: 4px;
}

input[type="checkbox"] {
  margin-top: 10px;
}

.week-view {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 20px;
}

.day-column {
  flex: 1;
  background-color: var(--background-color-white);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 140px;
}

.day-header {
  font-weight: bold;
  margin-bottom: 6px;
  color: var(--text-color);
  font-size: 14px;
  text-align: center;
}

.session,
.meal {
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
}

.no-sessions {
  font-style: italic;
  font-size: 12px;
  color: gray;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #676161;
  padding: 20px 30px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-button {
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.modal-close {
  position: absolute;
  top: 8px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.cancel-button {
  align-self: flex-start;
  background-color: #e53935;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.session-box {
  background-color: #e0f0ff;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 6px;
  font-size: 14px;
  cursor: pointer;
  color: black;
}

.session-block {
  background-color: #e0f0ff;
  padding: 15px;
  border-radius: 12px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: background-color 0.3s;
}
</style>