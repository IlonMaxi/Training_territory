<template>
  <div class="schedule">
    <h1 id="schedule" class="title">РАСПИСАНИЕ</h1>

    <div class="view-toggle">
      <button @click="showWeekView = !showWeekView">
        {{ showWeekView ? 'Режим дня' : 'Режим недели' }}
      </button>
    </div>

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

    <!-- Режим недели -->
    <div v-if="showWeekView" class="week-view">
      <div v-for="(day, index) in currentWeek" :key="'week-' + index" class="day-column">
        <h3 class="day-header">{{ dayjs(day.date).format('D MMMM, ddd') }}</h3>

        <div
          v-for="(session, i) in getSessionsByDate(day.date)"
          :key="'s' + i"
          class="session"
          @click="openDetails(session, 'session')"
        >
          <strong>{{ session.workout_name }}</strong><br>
          {{ formatTime(session.starttime) }} - {{ formatTime(session.endtime) }}
        </div>

        <div
          v-for="(meal, i) in getMealsByDate(day.date)"
          :key="'m' + i"
          class="meal"
          @click="openDetails(meal, 'meal')"
        >
          <strong>{{ meal.meal_type }}</strong>: {{ meal.food_name }} ({{ meal.calories }} ккал)
        </div>

        <div
          v-if="getSessionsByDate(day.date).length === 0 && getMealsByDate(day.date).length === 0"
          class="no-sessions"
        >
          Нет данных
        </div>
      </div>
    </div>

    <!-- Режим дня -->
    <div v-else>
      <div class="training-list">
        <div
          v-for="(session, index) in filteredTrainingSessions"
          :key="index"
          class="session-wrapper"
          @click="openDetails(session, 'session')"
        >
          <div class="bullet-line-wrapper">
            <div class="bullet"></div>
            <div class="line" v-if="index < filteredTrainingSessions.length - 1"></div>
          </div>
          <div class="session">
            <div class="session-info">
              <div class="session-details">
                <h3 class="session-title">Тренировка - {{ session.workout_name }}</h3>
                <ul class="session-description">
                  <li>Место: {{ session.location }}</li>
                  <li>Описание: {{ session.workout_description }}</li>
                </ul>
                <h4>Упражнения:</h4>
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

      <div id="nutrition" class="nutrition-list">
        <div
          v-for="(meal, index) in filteredNutritionData"
          :key="index"
          class="meal-wrapper"
          @click="openDetails(meal, 'meal')"
        >
          <div class="bullet-line-wrapper">
            <div class="bullet"></div>
            <div class="line" v-if="index < filteredNutritionData.length - 1"></div>
          </div>
          <div class="meal">
            <h3 class="meal-title">{{ meal.meal_type }}</h3>
            <h3 class="meal-title">{{ meal.food_name }} ({{ meal.calories }} ккал)</h3>
          </div>
        </div>
        <div v-if="filteredNutritionData.length === 0 && !error" class="no-meals">
          Нет запланированного питания на этот день.
        </div>
      </div>
    </div>

    <!-- Модальное окно с деталями -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeDetails">
      <div class="modal-content">
        <button class="close-button" @click="closeDetails">✖</button>
        <div v-if="selectedType === 'session'">
          <h2>Тренировка: {{ selectedItem.workout_name }}</h2>
          <p><strong>Описание:</strong> {{ selectedItem.workout_description }}</p>
          <p><strong>Место:</strong> {{ selectedItem.location }}</p>
          <p><strong>Упражнение:</strong> {{ selectedItem.exercise_name }} — {{ selectedItem.exercise_description }}</p>
          <p><strong>Оборудование:</strong> {{ selectedItem.equipment }}</p>
          <p><strong>Время:</strong> {{ formatTime(selectedItem.starttime) }} - {{ formatTime(selectedItem.endtime) }}</p>
        </div>

        <div v-else-if="selectedType === 'meal'">
          <h2>Питание: {{ selectedItem.meal_type }}</h2>
          <p><strong>Название:</strong> {{ selectedItem.food_name }}</p>
          <p><strong>Калории:</strong> {{ selectedItem.calories }} ккал</p>
          <p><strong>БЖУ:</strong> {{ selectedItem.proteins }} / {{ selectedItem.fats }} / {{ selectedItem.carbohydrates }}</p>
          <p><strong>Рецепт:</strong> {{ selectedItem.recipe_name }}</p>
          <p><strong>Ингредиенты:</strong> {{ selectedItem.ingredients }}</p>
          <p><strong>Инструкция:</strong> {{ selectedItem.instructions }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import 'dayjs/locale/ru'

export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    const today = new Date()
    return {
      selectedDay: today,
      currentWeekIndex: 0,
      showWeekView: false,
      year: [],
      trainingSessions: [],
      nutritionData: [],
      error: null,
      showModal: false,
      selectedItem: null,
      selectedType: ''
    }
  },
  computed: {
    currentWeek() {
      const start = this.currentWeekIndex * 7
      return this.year.slice(start, start + 7)
    },
    filteredTrainingSessions() {
      return this.getSessionsByDate(this.selectedDay)
    },
    filteredNutritionData() {
      return this.getMealsByDate(this.selectedDay)
    }
  },
  methods: {
    dayjs,
    openDetails(item, type) {
      this.selectedItem = item
      this.selectedType = type
      this.showModal = true
    },
    closeDetails() {
      this.showModal = false
      this.selectedItem = null
      this.selectedType = ''
    },
    async fetchSchedule() {
      try {
        const clientId = this.user.clientid
        const [scheduleRes, nutritionRes] = await Promise.all([
          fetch(`http://26.100.29.243:3000/api/schedule/client/${clientId}`),
          fetch(`http://26.100.29.243:3000/api/nutrition/client/${clientId}`)
        ])

        const scheduleData = await scheduleRes.json()
        const nutritionData = await nutritionRes.json()

        // Безопасная установка
        this.trainingSessions = Array.isArray(scheduleData) ? scheduleData : []
        this.nutritionData = Array.isArray(nutritionData) ? nutritionData : []

        if (!Array.isArray(scheduleData)) {
          console.warn('⚠ trainingSessions is not an array:', scheduleData)
        }
        if (!Array.isArray(nutritionData)) {
          console.warn('⚠ nutritionData is not an array:', nutritionData)
        }

      } catch (err) {
        console.error('❌ fetchSchedule error:', err)
        this.error = 'Не удалось загрузить данные.'
        this.trainingSessions = []
        this.nutritionData = []
      }
    },
    generateYear(startDate) {
      const year = []
      let current = dayjs(startDate).startOf('year').day(1)
      const days = current.isLeapYear?.() ? 366 : 365
      for (let i = 0; i < days; i++) {
        year.push({ date: current.toDate() })
        current = current.add(1, 'day')
      }
      return year
    },
    getWeekIndex(date) {
      const startOfYear = dayjs(date).startOf('year').day(1)
      return Math.floor(dayjs(date).diff(startOfYear, 'day') / 7)
    },
    getDayName(date) {
      return dayjs(date).locale('ru').format('ddd')
    },
    isToday(date) {
      return dayjs(date).isSame(dayjs(), 'day')
    },
    isSelected(date) {
      return dayjs(date).isSame(this.selectedDay, 'day')
    },
    formatTime(time) {
      return time?.slice?.(0, 5) || ''
    },
    selectDay(day) {
      this.selectedDay = day.date
    },
    prevWeek() {
      if (this.currentWeekIndex > 0) {
        this.currentWeekIndex--
        this.updateSelectedDay()
      }
    },
    nextWeek() {
      if (this.currentWeekIndex < Math.floor(this.year.length / 7)) {
        this.currentWeekIndex++
        this.updateSelectedDay()
      }
    },
    updateSelectedDay() {
      const week = this.currentWeek
      if (!week.find(d => this.isSelected(d.date))) {
        this.selectedDay = week[0].date
      }
    },
    getSessionsByDate(date) {
      if (!Array.isArray(this.trainingSessions)) return []
      return this.trainingSessions.filter(s => dayjs(s.date).isSame(date, 'day'))
    },
    getMealsByDate(date) {
      if (!Array.isArray(this.nutritionData)) return []
      return this.nutritionData.filter(m => dayjs(m.food_date).isSame(date, 'day'))
    }
  },
  created() {
    this.year = this.generateYear(this.selectedDay)
    this.currentWeekIndex = this.getWeekIndex(this.selectedDay)
    this.fetchSchedule()
    dayjs.locale('ru')
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
  background-color: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
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
</style>
