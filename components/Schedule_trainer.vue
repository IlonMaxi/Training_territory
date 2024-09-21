<template>
  <div class="schedule">
    <h1 class="title">РАСПИСАНИЕ</h1>
    <div class="date-picker">
      <button class="arrow-button" @click="prevWeek"><i class="fa-solid fa-chevron-left"></i></button>
      <div class="dates">
        <div 
          v-for="(day, index) in currentWeek" 
          :key="index" 
          :class="['date', { active: isToday(day.date) }]" 
          @click="selectDay(day)"
        >
          <p class="day-number">{{ day.date.getDate() }}</p>
          <p class="day-name">{{ getDayName(day.date) }}</p>
        </div>
      </div>
      <button class="arrow-button" @click="nextWeek"><i class="fa-solid fa-chevron-right"></i></button>
    </div>
    <div class="training-list">
      <div v-for="(session, index) in filteredTrainingSessions" :key="index" class="session-wrapper">
        <div class="bullet-line-wrapper">
          <div class="bullet"></div>
          <div class="line" v-if="index < filteredTrainingSessions.length - 1"></div>
        </div>
        <div class="session">
          <div class="session-info">
            <div class="session-details">
              <h2 class="session-title">Тренеровка -{{ session.title }}</h2>
              <ul class="session-description">
                <li>Место: {{ session.Место }}</li>
              </ul>
            </div>
          </div>
          <div class="session-time">
            <p>{{ session.Начало }} - {{ session.Время_окончания }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    const today = new Date();
    return {
      selectedDay: today,
      currentWeekIndex: this.getWeekIndex(today),
      year: this.generateYear(today),
      trainingSessions: [] // Данные, получаемые с сервера
    };
  },
  computed: {
    currentWeek() {
      const start = this.currentWeekIndex * 7;
      return this.year.slice(start, start + 7);
    },
    filteredTrainingSessions() {
      return this.trainingSessions.filter(session => {
        const sessionDate = new Date(session.Дата);
        return sessionDate.toDateString() === this.selectedDay.toDateString();
      });
    }
  },
  methods: {
    async fetchSchedule() {
      try {
        const coachId = this.$route.params.coachid; // Получаем coachId из маршрута
        console.log(`Fetching schedule for coach: ${coachId}`); // Лог для проверки
        const response = await fetch(`http://25.22.135.216:3000/api/schedule/${coachId}`); // Абсолютный URL
        
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        this.trainingSessions = data;
      } catch (error) {
        console.error("Ошибка при получении расписания:", error);
      }
    },
    generateYear(startDate) {
      const year = [];
      const startOfYear = new Date(startDate.getFullYear(), 0, 1);
      const dayOfWeek = startOfYear.getDay();
      const offset = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
      startOfYear.setDate(startOfYear.getDate() + offset);

      let currentDate = new Date(startOfYear);

      for (let i = 0; i < 365; i++) {
        year.push({ date: new Date(currentDate) });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return year;
    },
    getWeekIndex(date) {
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const dayOfWeek = startOfYear.getDay();
      const offset = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
      startOfYear.setDate(startOfYear.getDate() + offset);

      const daysDifference = Math.floor((date - startOfYear) / (1000 * 60 * 60 * 24));
      return Math.floor(daysDifference / 7);
    },
    getDayName(date) {
      return date.toLocaleDateString('ru-RU', { weekday: 'short' });
    },
    selectDay(day) {
      this.selectedDay = day.date;
    },
    isToday(date) {
      return this.selectedDay.toDateString() === date.toDateString();
    },
    prevWeek() {
      if (this.currentWeekIndex > 0) {
        this.currentWeekIndex--;
      }
    },
    nextWeek() {
      if (this.currentWeekIndex < Math.floor(this.year.length / 7)) {
        this.currentWeekIndex++;
      }
    }
  },
  created() {
    this.fetchSchedule(); // Загружаем расписание после создания компонента
  }
};
</script>

<style scoped>
.schedule {
  background-color: #272827;
  padding: 20px;
  border-radius: 8px;
  color: white;
  font-family: Arial, sans-serif;
  width: 90%;
  margin: 0 auto;
}

.title {
  text-align: center;
  margin-bottom: 20px;
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
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.dates {
  display: flex;
  justify-content: space-between;
  width: 70%;
  margin-right: 10px;
  margin-left: 10px;
  cursor: pointer;
}

.date {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  color: white;
  border: 2px solid transparent;
  border-radius: 20px;
}

.date.active {
  border-color: #dd7548;
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
  background-color: #dd7548;
  border-radius: 50%;
  z-index: 1;
}

.line {
  width: 2px;
  background-color: #dd7548;
  position: absolute;
  top: 25%;
  bottom: -20%;
}

.session {
  flex-grow: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  padding: 15px;
  border-radius: 10px;
}

.session-info {
  display: flex;
  align-items: center;
}

.session-details {
  margin-left: 10px;
}

.session-title {
  font-size: 18px;
  margin-bottom: 10px;
}

.session-description {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
  font-size: 14px;
}

.session-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 20px;
}

input[type="checkbox"] {
  margin-top: 10px;
}
</style>