<template>
  <section id="schedule" class="tt-container" aria-labelledby="schedule-title">
    <SectionHead eyebrow="Расписание" icon="fa-solid fa-calendar-days" title-id="schedule-title"
      lead="Тренировки назначает ваш тренер, рацион на каждый день составляется автоматически.">
      План на <span class="tt-accent">неделю</span>
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

      <!-- Режим дня: тренировки и питание выбранного дня -->
      <transition name="tt-swap" mode="out-in">
        <div v-if="view === 'day'" :key="`day-${selectedKey}`" class="day-view">
          <div class="column">
            <h3 class="tt-col-title">
              <span class="tt-col-icon"><i class="fa-solid fa-dumbbell"></i></span>
              Тренировки
              <span v-if="!loading" class="tt-chip">{{ daySessions.length }}</span>
            </h3>
            <div v-if="loading" class="list">
              <div class="tt-skeleton skeleton"></div>
              <div class="tt-skeleton skeleton"></div>
            </div>
            <div v-else-if="daySessions.length" class="list">
              <SessionCard v-for="(session, index) in daySessions" :key="session.scheduleid || index"
                :session="session" class="tt-stagger" :style="{ '--i': index }" @open="openDetails(session, 'session')" />
            </div>
            <div v-else class="tt-empty">
              <i class="fa-solid fa-bed"></i>
              Тренировок нет — день восстановления
            </div>
          </div>

          <div id="nutrition" class="column">
            <h3 class="tt-col-title">
              <span class="tt-col-icon tt-col-icon--blue"><i class="fa-solid fa-utensils"></i></span>
              Питание
              <span v-if="!loading && dayMeals.length" class="tt-chip tt-chip--blue">{{ dayKcal }} ккал</span>
            </h3>
            <div v-if="loading" class="list">
              <div class="tt-skeleton skeleton"></div>
              <div class="tt-skeleton skeleton"></div>
              <div class="tt-skeleton skeleton"></div>
            </div>
            <div v-else-if="dayMeals.length" class="list">
              <MealCard v-for="(meal, index) in dayMeals" :key="`${meal.meal_type}-${index}`" :meal="meal"
                class="tt-stagger" :style="{ '--i': index }" @open="openDetails(meal, 'meal')" />
            </div>
            <div v-else class="tt-empty">
              <i class="fa-solid fa-bowl-food"></i>
              Рацион на этот день ещё не составлен
            </div>
          </div>
        </div>

        <!-- Режим недели: семь колонок, клик по дню открывает его -->
        <WeekGrid v-else key="week" :week-start="weekStart" :selected="selectedDay" :count-for="countFor"
          @open="openDay">
          <template #default="{ date }">
            <SessionCard v-for="(session, index) in sessionsOn(date)" :key="`s-${session.scheduleid || index}`"
              :session="session" compact @open="openDetails(session, 'session')" />
            <MealCard v-for="(meal, index) in mealsOn(date)" :key="`m-${index}`" :meal="meal" compact
              @open="openDetails(meal, 'meal')" />
          </template>
        </WeekGrid>
      </transition>
    </Reveal>

    <ScheduleDetails :item="details.item" :type="details.type" @close="details.item = null" />
  </section>
</template>

<script>
import Reveal from '@/components/ui/Reveal.vue';
import SectionHead from '@/components/ui/SectionHead.vue';
import WeekStrip from '@/components/schedule/WeekStrip.vue';
import WeekGrid from '@/components/schedule/WeekGrid.vue';
import SessionCard from '@/components/schedule/SessionCard.vue';
import MealCard from '@/components/schedule/MealCard.vue';
import ScheduleDetails from '@/components/schedule/ScheduleDetails.vue';
import { addDays, startOfWeek, isSameDay, byStartTime } from '@/components/utils/week.js';

const MEAL_ORDER = { 'Завтрак': 0, 'Обед': 1, 'Ужин': 2 };

// Расписание клиента: данные загружает страница (ClientPage), здесь — только показ
export default {
  name: 'ClientSchedule',
  components: { Reveal, SectionHead, WeekStrip, WeekGrid, SessionCard, MealCard, ScheduleDetails },
  props: {
    sessions: { type: Array, default: () => [] },
    meals: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    error: { type: String, default: null }
  },
  data() {
    const today = new Date()
    return {
      view: 'day',
      selectedDay: today,
      weekStart: startOfWeek(today),
      details: { item: null, type: 'session' }
    }
  },
  computed: {
    selectedKey() {
      return this.selectedDay.toDateString()
    },
    daySessions() {
      return this.sessionsOn(this.selectedDay)
    },
    dayMeals() {
      return this.mealsOn(this.selectedDay)
    },
    dayKcal() {
      return this.dayMeals.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0)
    }
  },
  methods: {
    sessionsOn(date) {
      return this.sessions.filter(s => isSameDay(s.date, date)).sort(byStartTime)
    },
    mealsOn(date) {
      return this.meals
        .filter(m => isSameDay(m.food_date, date))
        .sort((a, b) => (MEAL_ORDER[a.meal_type] ?? 9) - (MEAL_ORDER[b.meal_type] ?? 9))
    },
    countFor(date) {
      return { sessions: this.sessionsOn(date).length, meals: this.mealsOn(date).length }
    },
    selectDay(date) {
      this.selectedDay = date
    },
    // Листаем неделю, сохраняя выбранный день недели
    shiftWeek(direction) {
      this.weekStart = addDays(this.weekStart, direction * 7)
      this.selectedDay = addDays(this.selectedDay, direction * 7)
    },
    goToday() {
      const today = new Date()
      this.weekStart = startOfWeek(today)
      this.selectedDay = today
    },
    openDay(date) {
      this.selectedDay = date
      this.view = 'day'
    },
    openDetails(item, type) {
      this.details = { item, type }
    }
  }
}
</script>

<style scoped>
.board {
  display: grid;
  gap: 24px;
}

/* ---------- режим дня ---------- */

.day-view {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: 24px;
}

.column {
  display: grid;
  align-content: start;
  gap: 14px;
}

.list {
  display: grid;
  gap: 12px;
}

.skeleton {
  height: 86px;
}

@media (max-width: 900px) {
  .day-view {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
