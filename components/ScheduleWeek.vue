<template>
    <div class="schedule">
        <h1 class="title">РАСПИСАНИЕ</h1>
        <div class="date-picker">
            <button class="arrow-button" @click="prevWeek">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
            <div class="dates">
                <div v-for="(day, index) in currentWeek" :key="index"
                    :class="['date', { active: isSelected(day.date), today: isToday(day.date) }]"
                    @click="selectDay(day)">
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
            <div v-for="(session, index) in filteredTrainingSessions" :key="index" class="session-wrapper">
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
        <div class="nutrition-list">
            <div v-for="(meal, index) in filteredNutritionData" :key="index" class="meal-wrapper">
                <div class="bullet-line-wrapper">
                    <div class="bullet"></div>
                    <div class="line" v-if="index < filteredNutritionData.length - 1"></div>
                </div>
                <div class="meal">
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
                const selectedDate = dayjs(this.selectedDay).startOf('day');
                return sessionDate.isSame(selectedDate, 'day');
            });
        },
        filteredNutritionData() {
            return this.nutritionData.filter(meal => {
                const mealDate = dayjs(meal.food_date).startOf('day');
                const selectedDate = dayjs(this.selectedDay).startOf('day');
                return mealDate.isSame(selectedDate, 'day');
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

                // Получение расписания тренировок
                const scheduleResponse = await fetch(`http://26.100.29.243:3000/api/schedule/client/${clientId}`);
                if (!scheduleResponse.ok) {
                    throw new Error("Ошибка при получении расписания тренировок.");
                }
                const scheduleData = await scheduleResponse.json();
                this.trainingSessions = scheduleData.trainingSessions || [];

                // Получение данных о питании
                const nutritionResponse = await fetch(`http://26.100.29.243:3000/api/nutrition/client/${clientId}`);
                if (!nutritionResponse.ok) {
                    throw new Error("Ошибка при получении данных о питании.");
                }
                const nutritionData = await nutritionResponse.json();
                this.nutritionData = nutritionData.nutrition || [];
                this.error = null;
            } catch (error) {
                this.error = error.message || "Неизвестная ошибка.";
            }
        },
        prevWeek() {
            if (this.currentWeekIndex > 0) {
                this.currentWeekIndex -= 1;
            }
        },
        nextWeek() {
            if ((this.currentWeekIndex + 1) * 7 < this.year.length) {
                this.currentWeekIndex += 1;
            }
        },
        selectDay(day) {
            this.selectedDay = day.date;
        },
        isToday(date) {
            return dayjs(date).isSame(dayjs(), 'day');
        },
        isSelected(date) {
            return dayjs(date).isSame(dayjs(this.selectedDay), 'day');
        },
        getDayName(date) {
            return dayjs(date).locale('ru').format('dddd');
        },
        formatTime(time) {
            return dayjs(time, 'HH:mm:ss').format('HH:mm');
        }
    },
    created() {
        // Инициализация года
        const yearStart = dayjs().startOf('year');
        for (let i = 0; i < 365; i++) {
            this.year.push({ date: yearStart.add(i, 'day').toDate() });
        }
        this.fetchSchedule();
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
  width: 4px;
  background-color: #ffffff;
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
  background-color: #444;
  /* Цвет фона блока питания */
  padding: 15px;
  border-radius: 10px;
  color: white;
  /* Цвет текста */
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
  background-color: #dd7548;
}

.meal-wrapper .line {
  width: 4px;
  background-color: #ffffff;
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
  align-items: center;
  font-size: 20px;
}

input[type="checkbox"] {
  margin-top: 10px;
}
</style>