<template>
  <div class="schedule">
    <h1 class="title">РАСПИСАНИЕ</h1>
    <div class="date-picker">
      <button class="arrow-button" @click="prevWeek">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <div class="dates">
        <div
          v-for="(day, index) in currentWeek"
          :key="index"
          :class="['date', { active: isSelected(day.date), today: isToday(day.date) }]"
          @click="selectDay(day)"
        >
          <p class="day-number">{{ day.date.getDate() }}</p>
          <p class="day-name">{{ getDayName(day.date) }}</p>
        </div>
      </div>
      <button class="arrow-button" @click="nextWeek">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
    <div class="training-list">
      <div
        v-for="(session, index) in filteredTrainingSessions"
        :key="index"
        class="session-wrapper"
      >
        <div class="bullet-line-wrapper">
          <div class="bullet"></div>
          <div class="line" v-if="index < filteredTrainingSessions.length - 1"></div>
        </div>
        <div class="session">
          <div class="session-info">
            <div class="session-details">
              <h2 class="session-title">Тренировка - {{ session.workout_name }}</h2>
              <ul class="session-description">
                <li>Место: {{ session.location }}</li>
                <li>Описание: {{ session.workout_description }}</li>
              </ul>
              <h3>Упражнения:</h3>
              <ul class="exercises-list">
                <li>
                  <strong>{{ session.exercise_name }}</strong>:
                  {{ session.exercise_description }} (Оборудование: {{ session.equipment }})
                </li>
              </ul>
            </div>
          </div>
          <div class="session-time">
            <p>{{ formatTime(session.starttime) }} - {{ formatTime(session.endtime) }}</p>
          </div>
        </div>
      </div>
      <div v-if="filteredTrainingSessions.length === 0 && !error" class="no-sessions">
        Нет запланированных тренировок на этот день.
      </div>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selectedDay: null,
      currentWeekIndex: 0,
      year: [],
      trainingSessions: [],
      error: null
    };
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
        return (
          sessionDate.getFullYear() === this.selectedDay.getFullYear() &&
          sessionDate.getMonth() === this.selectedDay.getMonth() &&
          sessionDate.getDate() === this.selectedDay.getDate()
        );
      });
    }
  },
  methods: {
    // Получение куки (при необходимости)
    getCookie(name) {
      if (process.client) { // Проверяем, что код выполняется на клиенте
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
      }
      return null;
    },
    // Установка куки
    setCookie(name, value, days) {
      if (process.client) { // Проверяем, что код выполняется на клиенте
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${date.toUTCString()}`;
      }
    },
    // Удаление куки
    deleteCookie(name) {
      if (process.client) { // Проверяем, что код выполняется на клиенте
        document.cookie = `${name}=; path=/; max-age=0;`;
      }
    },
    async fetchSchedule() {
      if (!this.user || !this.user.coachid) {
        this.error = "Отсутствует идентификатор тренера.";
        return;
      }

      try {
        const coachId = this.user.coachid;
        const response = await fetch(`http://26.100.29.243:3000/api/schedule/${coachId}`);
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        const data = await response.json();
        this.trainingSessions = data;
        this.error = null;
      } catch (error) {
        console.error("Ошибка при получении расписания:", error);
        this.error = "Не удалось загрузить расписание. Пожалуйста, попробуйте позже.";
      }
    },
    generateYear(startDate) {
      const year = [];
      const startOfYear = new Date(startDate.getFullYear(), 0, 1);
      const dayOfWeek = startOfYear.getDay();
      const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfYear.setDate(startOfYear.getDate() + offset);

      let currentDate = new Date(startOfYear);
      const isLeapYear = (startDate.getFullYear() % 4 === 0 && startDate.getFullYear() % 100 !== 0) || (startDate.getFullYear() % 400 === 0);
      const daysInYear = isLeapYear ? 366 : 365;

      for (let i = 0; i < daysInYear; i++) {
        year.push({ date: new Date(currentDate) });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return year;
    },
    getDayName(date) {
      return date.toLocaleDateString('ru-RU', { weekday: 'short' });
    },
    selectDay(day) {
      this.selectedDay = day.date;
      this.setCookie('selectedDay', day.date.toISOString(), 7); // Сохраняем выбранный день в куки
    },
    isToday(date) {
      const today = new Date();
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    },
    isSelected(date) {
      return (
        date.getFullYear() === this.selectedDay.getFullYear() &&
        date.getMonth() === this.selectedDay.getMonth() &&
        date.getDate() === this.selectedDay.getDate()
      );
    },
    formatTime(time) {
      return time.slice(0, 5);
    },
    prevWeek() {
      if (this.currentWeekIndex > 0) {
        this.currentWeekIndex--;
        this.updateSelectedDay();
      }
    },
    nextWeek() {
      if (this.currentWeekIndex < Math.floor(this.year.length / 7)) {
        this.currentWeekIndex++;
        this.updateSelectedDay();
      }
    },
    updateSelectedDay() {
      const week = this.currentWeek;
      const found = week.find(day => this.isSelected(day.date));
      if (!found) {
        this.selectedDay = week[0].date;
        this.setCookie('selectedDay', week[0].date.toISOString(), 7);
      }
    },
    /**
     * Вычисляет индекс недели для заданной даты.
     * @param {Date} date - Дата, для которой вычисляется индекс недели.
     * @returns {Number} Индекс недели.
     */
    getWeekIndex(date) {
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = Math.floor((date - startOfYear) / (1000 * 60 * 60 * 24));
      return Math.floor(pastDaysOfYear / 7);
    }
  },
  created() {
    if (process.client) { // Проверяем, что код выполняется на клиенте
      const savedDay = this.getCookie('selectedDay');
      const today = new Date();
      this.selectedDay = savedDay ? new Date(savedDay) : today; // Восстанавливаем выбранный день из куки или используем сегодня
      this.year = this.generateYear(this.selectedDay); // Генерация года
      this.currentWeekIndex = this.getWeekIndex(this.selectedDay); // Индекс текущей недели
      this.fetchSchedule(); // Загрузка расписания
    }
  }
};
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
  font-size: 24px;
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
}

.session {
  flex-grow: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--background-color-white);
  padding: 15px;
  border-radius: 10px;
  transition: background-color 0.5s, color 0.5s;
}

.session-info {
  display: flex;
  align-items: center;
}

.session-details {
  margin-left: 10px;
}

.session-title {
  font-size: 24px;
  margin-bottom: 10px;
  color: var(--text-color);
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
  align-items: center;
  font-size: 20px;
  color: var(--text-color);
}

input[type="checkbox"] {
  margin-top: 10px;
}
</style>