<template>
  <div class="schedule">
    <h1 id="schedule" class="title">РАСПИСАНИЕ</h1>
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

    <!-- Список тренировок -->
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
      <!-- Сообщение, если нет тренировок на выбранный день -->
      <div v-if="filteredTrainingSessions.length === 0 && !error" class="no-sessions">
        Нет запланированных тренировок на этот день.
      </div>
      <!-- Сообщение об ошибке -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>

    <!-- Список питания -->
    <div id="nutrition" class="nutrition-list">
      <div
        v-for="(meal, index) in filteredNutritionData"
        :key="index"
        class="meal-wrapper"
      >
        <div class="bullet-line-wrapper">
          <div class="bullet"></div>
          <div class="line" v-if="index < filteredNutritionData.length - 1"></div>
        </div>
        <div class="meal">
          <h3 class="meal-title">{{ meal.meal_type }}</h3>
          <h3 class="meal-title">{{ meal.food_name }} ({{ meal.calories }} ккал)</h3>
          <p><strong>Описание:</strong> {{ meal.food_description }}</p>
          <p>
            <strong>Белки:</strong> {{ meal.proteins }} г,
            <strong>Жиры:</strong> {{ meal.fats }} г,
            <strong>Углеводы:</strong> {{ meal.carbohydrates }} г
          </p>
          <h4>Рецепт - {{ meal.recipe_name }}</h4>
          <p><strong>Ингредиенты:</strong> {{ meal.ingredients }}</p>
          <p><strong>Время приготовления:</strong> {{ meal.preparation_time.minutes }} минут</p>
          <p><strong>Инструкция:</strong> {{ meal.instructions }}</p>
        </div>
      </div>
      <!-- Сообщение, если нет питания на выбранный день -->
      <div v-if="filteredNutritionData.length === 0 && !error" class="no-meals">
        Нет запланированного питания на этот день.
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';
import 'dayjs/locale/ru'; // Убедитесь, что локаль подключена

export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    const today = new Date();
    return {
      selectedDay: today,
      currentWeekIndex: 0, // Инициализируем позже в created
      year: [],
      trainingSessions: [],
      nutritionData: [],
      error: null, // Для отображения ошибок
    };
  },
  computed: {
    currentWeek() {
      const start = this.currentWeekIndex * 7;
      return this.year.slice(start, start + 7);
    },
    filteredTrainingSessions() {
      return this.trainingSessions.filter(session => {
        const sessionDate = dayjs(session.date).startOf('day');
        const selected = dayjs(this.selectedDay).startOf('day');
        return sessionDate.isSame(selected, 'day');
      });
    },
    filteredNutritionData() {
      return this.nutritionData.filter(meal => {
        const mealDate = dayjs(meal.food_date).startOf('day'); // Убедитесь, что поле food_date правильно
        const selected = dayjs(this.selectedDay).startOf('day');
        return mealDate.isSame(selected, 'day');
      });
    },
  },
  methods: {
    async fetchSchedule() {
      if (!this.user || !this.user.clientid) {
        this.error = "Отсутствует идентификатор клиента.";
        return;
      }

      try {
        const clientId = this.user.clientid;

        // Запрос для получения расписания тренировок
        const scheduleResponse = await fetch(`http://26.100.29.243:3000/api/schedule/client/${clientId}`);
        if (!scheduleResponse.ok) {
          throw new Error(`Ошибка HTTP: ${scheduleResponse.status}`);
        }
        const scheduleData = await scheduleResponse.json();
        console.log('Полученные данные расписания:', scheduleData); // Для отладки
        this.trainingSessions = scheduleData;

        // Запрос для получения питания
        const nutritionResponse = await fetch(`http://26.100.29.243:3000/api/nutrition/client/${clientId}`);
        if (!nutritionResponse.ok) {
          throw new Error(`Ошибка HTTP: ${nutritionResponse.status}`);
        }
        const nutritionData = await nutritionResponse.json();
        console.log('Полученные данные питания:', nutritionData); // Для отладки
        this.nutritionData = nutritionData;
      } catch (error) {
        console.error("Ошибка при получении данных:", error);
        this.error = "Не удалось загрузить данные. Пожалуйста, попробуйте позже.";
      }
    },
    generateYear(startDate) {
      const year = [];
      const startOfYear = dayjs(startDate).startOf('year').day(1).toDate(); // Понедельник как первый день недели
      let currentDate = dayjs(startOfYear);

      // Определяем, является ли год високосным
      const yearNumber = dayjs(startDate).year();
      const isLeapYear = (yearNumber % 4 === 0 && yearNumber % 100 !== 0) || (yearNumber % 400 === 0);
      const daysInYear = isLeapYear ? 366 : 365;

      for (let i = 0; i < daysInYear; i++) {
        year.push({ date: currentDate.toDate() });
        currentDate = currentDate.add(1, 'day');
      }

      return year;
    },
    getWeekIndex(date) {
      const startOfYear = dayjs(date).startOf('year').day(1); // Понедельник как первый день недели
      const daysDifference = dayjs(date).diff(startOfYear, 'day');
      return Math.floor(daysDifference / 7);
    },
    getDayName(date) {
      return dayjs(date).locale('ru').format('ddd');
    },
    selectDay(day) {
      this.selectedDay = day.date;
      this.setCookie('selectedDay', day.date.toISOString(), 7); // Сохраняем выбранный день в куки
    },
    isToday(date) {
      return dayjs(date).isSame(dayjs(), 'day');
    },
    isSelected(date) {
      return dayjs(date).isSame(dayjs(this.selectedDay), 'day');
    },
    formatTime(time) {
      // Преобразование времени из формата 'HH:MM:SS' в 'HH:MM'
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
      const found = week.find(day =>
        dayjs(day.date).isSame(this.selectedDay, 'day')
      );
      if (!found) {
        this.selectedDay = week[0].date;
        this.setCookie('selectedDay', week[0].date.toISOString(), 7);
      }
    },
    /**
     * Восстанавливает выбранный день из куки.
     * @returns {Date|null} Выбранный день или null, если куки отсутствуют.
     */
    getSavedDay() {
      const savedDay = this.getCookie('selectedDay');
      return savedDay ? new Date(savedDay) : null;
    },
    // Установка куки
    setCookie(name, value, days) {
      if (process.client) { // Проверяем, что код выполняется на клиенте
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${date.toUTCString()}`;
      }
    },
    // Получение куки
    getCookie(name) {
      if (process.client) { // Проверяем, что код выполняется на клиенте
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
      }
      return null;
    },
  },
  created() {
    if (this.user) {
      this.selectedDay = this.getSavedDay() || new Date(); // Восстанавливаем выбранный день из куки или используем сегодня
      this.year = this.generateYear(this.selectedDay); // Генерация года
      this.currentWeekIndex = this.getWeekIndex(this.selectedDay); // Индекс текущей недели
      this.fetchSchedule(); // Загрузка расписания и питания
    } else {
      this.error = "Пользователь не авторизован.";
    }
    dayjs.locale('ru'); // Устанавливаем локаль
  },
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

.nutrition-list {
  margin-top: 20px;
}

.meal-wrapper {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  position: relative;
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

.meal-wrapper .line {
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
