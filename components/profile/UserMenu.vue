<template>
  <div class="progress">
    <!-- Сводка: главные показатели и анализ -->
    <div class="overview">
      <div class="tt-dark summary-card">
        <svg class="summary-rings" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="92" />
          <circle cx="100" cy="100" r="70" />
          <circle cx="100" cy="100" r="48" />
        </svg>

        <div class="who">
          <span class="tt-avatar photo">
            <img v-if="photo && !photoFailed" :src="photo" alt="" @error="photoFailed = true" />
            <template v-else>{{ initials }}</template>
          </span>
          <div class="who-text">
            <span class="who-label">С первого замера</span>
            <b class="who-name">{{ fullName }}</b>
          </div>
        </div>

        <div v-if="loadingSummary" class="kpis">
          <span v-for="n in 4" :key="n" class="tt-dark-tile kpi kpi--skeleton"></span>
        </div>
        <div v-else-if="summary" class="kpis">
          <div v-for="kpi in kpis" :key="kpi.key" class="tt-dark-tile kpi">
            <span class="kpi-label">{{ kpi.label }}</span>
            <b :class="['kpi-value', direction(kpi.value)]">
              {{ signed(kpi.value) }}<small>%</small>
            </b>
            <i :class="['kpi-arrow', arrowIcon(kpi.value), direction(kpi.value)]" aria-hidden="true"></i>
          </div>
        </div>
        <div v-else class="summary-empty">
          <p>Пока нет замеров — внесите первые, и здесь появится прогресс.</p>
          <nuxt-link :to="{ path: '/ClientPage', query: { section: 'progress' } }" class="tt-btn tt-btn--light tt-btn--sm">
            <i class="fa-solid fa-ruler"></i> Внести замеры
          </nuxt-link>
        </div>

        <svg class="summary-ecg" viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true">
          <path pathLength="1" d="M0 30 L118 30 L128 22 L136 36 L148 6 L160 38 L168 26 L176 30 L300 30" />
        </svg>
      </div>

      <div class="tt-board analysis">
        <h3 class="tt-col-title">
          <span class="tt-col-icon tt-col-icon--blue"><i class="fa-solid fa-wand-magic-sparkles"></i></span>
          Анализ последнего замера
        </h3>
        <div v-if="loadingSummary" class="analysis-list">
          <span v-for="n in 3" :key="n" class="tt-skeleton analysis-skeleton"></span>
        </div>
        <ul v-else-if="analysis.length" class="analysis-list">
          <li v-for="item in analysis" :key="item.key" class="tt-tile analysis-item">
            <span class="analysis-label"><i :class="item.icon"></i> {{ item.label }}</span>
            <p>{{ item.text }}</p>
          </li>
        </ul>
        <p v-else class="analysis-empty">
          Анализ появится после нескольких замеров: его составляет система, сравнивая показатели между собой.
        </p>
      </div>
    </div>

    <!-- Изменения по всем показателям -->
    <section v-if="summary" class="tt-board section-card" aria-labelledby="changes-title">
      <div class="section-card-head">
        <h3 id="changes-title" class="tt-col-title">
          <span class="tt-col-icon"><i class="fa-solid fa-arrow-trend-up"></i></span>
          Изменения по показателям
        </h3>
        <span class="legend">
          <span class="legend-item"><span class="legend-dot legend-dot--up"></span> выросло</span>
          <span class="legend-item"><span class="legend-dot legend-dot--down"></span> снизилось</span>
        </span>
      </div>
      <ProgressBars :summary="summary" :groups="groups" />
    </section>

    <!-- Графики по замерам -->
    <section class="tt-board section-card" aria-labelledby="charts-title">
      <div class="section-card-head">
        <h3 id="charts-title" class="tt-col-title">
          <span class="tt-col-icon"><i class="fa-solid fa-chart-area"></i></span>
          Графики
        </h3>
        <div class="tt-segment types" role="group" aria-label="Группа показателей">
          <button v-for="type in types" :key="type.key" type="button"
            :class="{ 'is-active': currentType === type.key }" @click="loadAndSet(type.key)">
            {{ type.label }}
          </button>
        </div>
      </div>

      <div v-if="loadingHistory" class="chart-grid">
        <span v-for="n in 3" :key="n" class="tt-skeleton chart-skeleton"></span>
      </div>
      <div v-else-if="currentHistory.length" :key="currentType" class="chart-grid">
        <article v-for="(param, index) in currentParams" :key="param" class="tt-card tt-card--lift chart-card tt-stagger"
          :style="{ '--i': index }">
          <header class="chart-head">
            <span class="chart-name">{{ paramLabels[param] }}</span>
            <span class="chart-value">
              <b>{{ formatValue(getLast(param)) }}</b>
              <span v-if="getTrend(param)" :class="['tt-chip', getTrend(param) > 0 ? '' : 'tt-chip--blue']">
                <i :class="getTrend(param) > 0 ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'"></i>
                {{ Math.abs(getTrend(param)) }}%
              </span>
            </span>
          </header>
          <div class="chart-box">
            <canvas :ref="`${param}Chart`"></canvas>
          </div>
          <footer class="chart-foot">
            <button type="button" class="forecast-btn" :disabled="predicting[param] || currentHistory.length < 2"
              @click="predictFor(param)">
              <i :class="predicting[param] ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-wand-magic-sparkles'"></i>
              {{ predicting[param] ? 'Считаю…' : 'Прогноз на 4 недели' }}
            </button>
            <div v-if="predictions[param] !== undefined" class="forecast">
              <span class="forecast-value">≈ {{ formatValue(predictions[param]) }}</span>
              <span v-if="predictionMeta[param]" class="forecast-meta">
                {{ getForecastModelLabel(predictionMeta[param].model) }}
                <template v-if="predictionMeta[param].confidence !== null">
                  · доверие {{ Math.round(predictionMeta[param].confidence * 100) }}%
                </template>
              </span>
            </div>
          </footer>
        </article>
      </div>
      <div v-else class="tt-empty">
        <i class="fa-solid fa-chart-line"></i>
        Замеров этой группы пока нет — графики появятся после первых записей.
      </div>
    </section>
  </div>
</template>

<script>
import Chart from 'chart.js';
import ProgressBars from '@/components/profile/ProgressBars.vue';
import { readUser } from '@/components/utils/cabinet.js';
import { joinName, initialsOf } from '@/components/utils/format.js';

const BRAND = '#f8500a';
const BLUE = '#3760e7';
const TICKS = '#8a90a6';

export default {
  name: 'UserMenu',
  components: { ProgressBars },
  data() {
    return {
      client: null,
      photoFailed: false,
      summary: null,
      loadingSummary: true,
      currentType: null,
      currentHistory: [],
      loadingHistory: false,
      predictions: {},
      predicting: {},
      predictionSeries: {},
      predictionMeta: {},
      types: [
        { key: 'kg', label: 'Килограммы' },
        { key: 'percentage', label: 'Проценты' },
        { key: 'unit', label: 'Единицы' },
        { key: 'cm_upper', label: 'Обхваты: верх' },
        { key: 'cm_arms', label: 'Руки' },
        { key: 'cm_legs', label: 'Ноги' }
      ],
      paramLabels: {
        // Measurements_in_units
        bmi: 'Индекс массы тела',
        metabolism: 'Метаболизм',
        body_age: 'Возраст тела',

        // Measurements_in_kilograms
        weight: 'Вес',
        fat_mass: 'Жировая масса',
        skeletal_mass: 'Скелетная масса',
        muscle_mass: 'Мышечная масса',
        water_content: 'Содержание воды',
        bone_mass: 'Костная масса',
        lbm: 'Масса без жира (LBM)',

        // Measurements_in_percentage
        fat_percentage: 'Процент жира',
        skeletal_mass_percentage: 'Скелетная масса (%)',
        muscle_dynamics: 'Динамика мышц',
        body_water: 'Вода (%)',
        protein: 'Белок',
        fat_content: 'Содержание жира',

        // Measurements_in_centimeters
        chest_circumference: 'Обхват груди',
        waist_circumference: 'Обхват талии',
        hip_circumference: 'Обхват бёдер',
        bicep_circumference: 'Обхват бицепса',
        forearm_circumference: 'Обхват предплечья',
        quadriceps_circumference: 'Обхват квадрицепса',
        calf_circumference: 'Обхват икр',
        thigh_circumference: 'Обхват бедра',
        neck_circumference: 'Обхват шеи',
        waist_inhale_circumference: 'Талия (вдох)'
      },
      typeParams: {
        unit: ['bmi', 'metabolism', 'body_age'],
        kg: ['weight', 'fat_mass', 'skeletal_mass', 'muscle_mass', 'water_content', 'bone_mass', 'lbm'],
        percentage: [
          'fat_percentage', 'skeletal_mass_percentage', 'muscle_dynamics',
          'body_water', 'protein', 'fat_content'
        ],
        cm_upper: ['chest_circumference', 'waist_circumference', 'neck_circumference', 'waist_inhale_circumference'],
        cm_arms: ['bicep_circumference', 'forearm_circumference'],
        cm_legs: ['hip_circumference', 'thigh_circumference', 'calf_circumference', 'quadriceps_circumference']
      },
      // Группы для столбиков — названия как в ответе /progress-summary
      groups: [
        {
          title: 'Состав тела',
          keys: ['Вес', 'Жировая масса', 'Мышечная масса', 'Скелетная масса', 'Содержание воды', 'Костная масса', 'Масса без жира']
        },
        {
          title: 'В процентах',
          keys: ['Процент жира', 'Процент скелетных мышц', 'Динамика мышц', 'Вода в организме', 'Белок', 'Жировое содержание']
        },
        { title: 'Показатели', keys: ['Индекс массы тела', 'Метаболизм', 'Возраст тела'] },
        {
          title: 'Обхваты',
          keys: [
            'Обхват груди', 'Обхват талии', 'Обхват талии при вдохе', 'Обхват бёдер', 'Обхват бедра',
            'Обхват бицепса', 'Обхват предплечья', 'Обхват квадрицепса', 'Обхват икры', 'Обхват шеи'
          ]
        }
      ]
    };
  },
  computed: {
    clientId() {
      const user = readUser();
      return user && user.clientid;
    },
    fullName() {
      return this.client ? joinName(this.client.firstName, this.client.lastName) : '';
    },
    initials() {
      return this.client ? initialsOf(this.client.firstName, this.client.lastName) : '';
    },
    photo() {
      const image = this.client && this.client.imageUrl;
      return image && image !== 'default.jpg' ? `/api/uploads/${image}` : null;
    },
    kpis() {
      return [
        { key: 'Вес', label: 'Вес' },
        { key: 'Жировая масса', label: 'Жир' },
        { key: 'Мышечная масса', label: 'Мышцы' },
        { key: 'Метаболизм', label: 'Метаболизм' }
      ].map(item => ({ ...item, value: Math.round(Number(this.summary[item.key]) || 0) }));
    },
    analysis() {
      if (!this.summary) return [];
      return [
        { key: 'Анализ замеров', label: 'Мышцы', icon: 'fa-solid fa-dumbbell' },
        { key: 'Анализ веса', label: 'Вес', icon: 'fa-solid fa-weight-scale' },
        { key: 'Полный анализ замеров', label: 'Состав тела в целом', icon: 'fa-solid fa-person' },
        { key: 'Полный анализ веса', label: 'Вес в целом', icon: 'fa-solid fa-chart-line' }
      ]
        .map(item => ({ ...item, text: this.summary[item.key] }))
        .filter(item => item.text);
    },
    currentParams() {
      return this.currentType ? this.typeParams[this.currentType] : [];
    }
  },
  mounted() {
    if (!this.clientId) {
      this.loadingSummary = false;
      return;
    }
    this.loadProfile();
    this.loadSummary();
    // Графики сразу показываем по самой частой группе — килограммам
    this.loadAndSet('kg');
  },
  beforeDestroy() {
    this.destroyCharts();
  },
  methods: {
    direction(value) {
      if (value > 0) return 'up';
      if (value < 0) return 'down';
      return 'flat';
    },
    signed(value) {
      if (value > 0) return `+${value}`;
      if (value < 0) return `−${Math.abs(value)}`;
      return '0';
    },
    arrowIcon(value) {
      if (value > 0) return 'fa-solid fa-arrow-trend-up';
      if (value < 0) return 'fa-solid fa-arrow-trend-down';
      return 'fa-solid fa-minus';
    },
    formatValue(value) {
      const number = Number(value);
      if (value === null || value === undefined || value === '-' || Number.isNaN(number)) return '—';
      return String(Math.round(number * 10) / 10).replace('.', ',');
    },
    async loadProfile() {
      try {
        const response = await fetch(`/api/clients/${this.clientId}`);
        if (response.ok) this.client = await response.json();
      } catch (error) {
        console.error('Не удалось загрузить профиль:', error);
      }
    },
    async loadSummary() {
      this.loadingSummary = true;
      try {
        const response = await fetch(`/api/clients/${this.clientId}/progress-summary`);
        // 404 — замеров ещё нет: показываем приглашение внести первые
        this.summary = response.ok ? await response.json() : null;
      } catch (error) {
        console.error('Не удалось загрузить прогресс:', error);
        this.summary = null;
      } finally {
        this.loadingSummary = false;
      }
    },
    getLast(param) {
      return this.currentHistory.length ? this.currentHistory[this.currentHistory.length - 1][param] : null;
    },
    getTrend(param) {
      if (this.currentHistory.length < 2) return 0;
      const first = Number(this.currentHistory[0][param]);
      const last = Number(this.currentHistory[this.currentHistory.length - 1][param]);
      if (!first || Number.isNaN(first) || Number.isNaN(last)) return 0;
      return Math.round(((last - first) / first) * 100);
    },
    getForecastModelLabel(model) {
      const labels = {
        ridge_regression: 'Ridge-регрессия',
        random_forest_regressor: 'Random Forest',
        gradient_boosting_regressor: 'Gradient Boosting',
        linear_fallback: 'Линейный прогноз'
      };
      return labels[model] || 'ML-прогноз';
    },
    async loadAndSet(type) {
      if (!this.clientId) return;
      this.currentType = type;
      this.loadingHistory = true;
      this.destroyCharts();
      try {
        const sourceType = type.startsWith('cm_') ? 'cm' : type;
        const response = await fetch(`/api/clients/${this.clientId}/${sourceType}-measurements-history`);
        const data = response.ok ? await response.json() : [];
        // Пока грузилось, могли переключить группу — старый ответ не нужен
        if (this.currentType !== type) return;
        this.currentHistory = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Не удалось загрузить историю замеров:', error);
        this.currentHistory = [];
      } finally {
        if (this.currentType === type) {
          this.loadingHistory = false;
          this.$nextTick(() => this.renderCharts());
        }
      }
    },
    destroyCharts() {
      Object.values(this.charts || {}).forEach(chart => chart.destroy());
      this.charts = {};
    },
    renderCharts() {
      if (!this.charts) this.charts = {};
      this.currentParams.forEach((param) => {
        const ref = this.$refs[`${param}Chart`];
        const canvas = Array.isArray(ref) ? ref[0] : ref;
        if (!canvas) return;

        const values = this.currentHistory.map(item => item[param]);
        const numbers = values.filter(value => typeof value === 'number' && !Number.isNaN(value));
        const max = numbers.length ? Math.max(...numbers) : 1;
        const min = numbers.length ? Math.min(...numbers) : 0;
        const range = max - min || Math.max(Math.abs(max), 1);
        const pad = range * 0.12;

        const forecast = this.predictionSeries[param] || [];
        const labels = [
          ...this.currentHistory.map(item => item.date || ''),
          ...forecast.map(point => point.date || '')
        ];
        const historyData = [...values, ...Array(forecast.length).fill(null)];
        // Прогноз продолжает линию от последней точки истории — без разрыва
        const forecastData = forecast.length
          ? [...Array(values.length - 1).fill(null), values[values.length - 1], ...forecast.map(point => point.value)]
          : [];

        const context = canvas.getContext('2d');
        const fill = context.createLinearGradient(0, 0, 0, canvas.clientHeight || 150);
        fill.addColorStop(0, 'rgba(248, 80, 10, 0.22)');
        fill.addColorStop(1, 'rgba(248, 80, 10, 0)');

        if (this.charts[param]) this.charts[param].destroy();
        this.charts[param] = new Chart(canvas, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                data: historyData,
                borderColor: BRAND,
                backgroundColor: fill,
                fill: 'start',
                borderWidth: 2.5,
                pointRadius: values.length > 12 ? 0 : 3,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: BRAND,
                pointBorderWidth: 2,
                pointHoverRadius: 5
              },
              ...(forecast.length ? [{
                data: forecastData,
                borderColor: BLUE,
                backgroundColor: 'transparent',
                fill: false,
                borderWidth: 2,
                borderDash: [5, 4],
                pointRadius: 0,
                pointHoverRadius: 4
              }] : [])
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: false },
            tooltips: {
              mode: 'index',
              intersect: false,
              backgroundColor: '#0f1427',
              titleFontColor: '#ffffff',
              bodyFontColor: '#ffffff',
              displayColors: false,
              xPadding: 10,
              yPadding: 8,
              cornerRadius: 10,
              callbacks: {
                label: item => (item.yLabel === null ? '' : this.formatValue(item.yLabel))
              }
            },
            hover: { mode: 'index', intersect: false },
            layout: { padding: { top: 8, bottom: 2, left: 0, right: 4 } },
            scales: {
              xAxes: [{
                display: true,
                gridLines: { display: false },
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 4,
                  maxRotation: 0,
                  fontSize: 10,
                  fontColor: TICKS,
                  callback: value => (value ? String(value).slice(5).split('-').reverse().join('.') : '')
                }
              }],
              yAxes: [{
                display: true,
                gridLines: { color: 'rgba(138, 144, 166, 0.15)', drawBorder: false, zeroLineColor: 'rgba(138, 144, 166, 0.15)' },
                ticks: {
                  fontSize: 10,
                  fontColor: TICKS,
                  padding: 6,
                  suggestedMax: max + pad,
                  suggestedMin: min - pad,
                  maxTicksLimit: 4
                }
              }]
            },
            elements: { line: { tension: 0.35 } },
            animation: { duration: 700, easing: 'easeOutQuart' }
          }
        });
      });
    },
    async predictFor(param) {
      if (!this.currentHistory.length) return;
      const series = this.currentHistory
        .map(item => ({ date: item.date, value: item[param] }))
        .filter(point => point.value !== null && point.value !== undefined);

      if (series.length < 2) return;

      this.$set(this.predicting, param, true);
      try {
        const response = await fetch('/api/ml/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ series, weeks: 4, degree: 2 })
        });
        const data = await response.json();
        if (response.ok) {
          this.$set(this.predictions, param, data && data.predicted ? data.predicted.value : undefined);
          this.$set(this.predictionSeries, param, (data && data.series) || []);
          this.$set(this.predictionMeta, param, {
            model: data && data.model,
            confidence: data && data.quality && data.quality.confidence !== undefined
              ? data.quality.confidence
              : null
          });
          this.$nextTick(() => this.renderCharts());
        }
      } catch (error) {
        console.error('Ошибка при прогнозе:', error);
      } finally {
        this.$set(this.predicting, param, false);
      }
    }
  }
};
</script>

<style scoped>
.progress {
  display: grid;
  gap: 24px;
}

/* ---------- сводка ---------- */

.overview {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: 20px;
}

/* Фон, свечение и скругление — от .tt-dark */
.summary-card {
  display: grid;
  align-content: start;
  gap: 22px;
  padding: 26px 26px 54px;
}

/* Концентрические круги — как «мишень» прогресса */
.summary-rings {
  position: absolute;
  top: -40px;
  right: -40px;
  z-index: -1;
  width: 220px;
  height: 220px;
  fill: none;
  stroke: rgba(255, 255, 255, 0.07);
  stroke-width: 1.5;
}

.who {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* Аватар — круглый .tt-avatar, на тёмном фоне с обводкой */
.photo {
  width: 56px;
  height: 56px;
  border: 2px solid rgba(255, 122, 61, 0.7);
  font-size: 19px;
}

.who-text {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.who-label {
  color: rgba(255, 255, 255, 0.55);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.who-name {
  overflow: hidden;
  font-size: 19px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.kpis {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.kpi {
  position: relative;
  display: grid;
  gap: 4px;
  min-height: 92px;
  padding: 14px 16px;
}

.kpi--skeleton {
  animation: kpi-pulse 1.4s ease-in-out infinite;
}

@keyframes kpi-pulse {
  50% {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.kpi-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 600;
}

.kpi-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.kpi-value small {
  margin-left: 2px;
  font-size: 18px;
  opacity: 0.7;
}

.kpi-value.up {
  color: #ff9a66;
}

.kpi-value.down {
  color: #9fb4ff;
}

.kpi-arrow {
  position: absolute;
  top: 14px;
  right: 14px;
  color: rgba(255, 255, 255, 0.35);
  font-size: 14px;
}

.kpi-arrow.up {
  color: #ff7a3d;
}

.kpi-arrow.down {
  color: #7c9bff;
}

.summary-empty {
  display: grid;
  justify-items: start;
  gap: 14px;
}

.summary-empty p {
  margin: 0;
  color: rgba(255, 255, 255, 0.75);
  font-size: 15px;
  line-height: 1.55;
}

.summary-ecg {
  position: absolute;
  right: 26px;
  bottom: 14px;
  left: 26px;
  height: 30px;
}

.summary-ecg path {
  fill: none;
  stroke: #ff7a3d;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: ecg-draw 1.6s var(--tt-ease) 0.3s forwards;
  vector-effect: non-scaling-stroke;
}

@keyframes ecg-draw {
  to {
    stroke-dashoffset: 0;
  }
}

.analysis {
  display: grid;
  align-content: start;
  gap: 16px;
}

.analysis-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.analysis-skeleton {
  height: 64px;
  border-radius: var(--tt-radius-md);
}

.analysis-item {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
}

.analysis-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--tt-blue-deep);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.analysis-item p {
  margin: 0;
  color: var(--tt-soft);
  font-size: 14px;
  line-height: 1.55;
}

.analysis-empty {
  margin: 0;
  color: var(--tt-muted);
  font-size: 14px;
  line-height: 1.6;
}

/* ---------- блоки с графиками и столбиками ---------- */

.section-card {
  display: grid;
  gap: 22px;
}

.section-card-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 20px;
}

.legend {
  display: flex;
  gap: 14px;
  color: var(--tt-muted);
  font-size: 13px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

.legend-dot--up {
  background-color: var(--tt-brand);
}

.legend-dot--down {
  background-color: var(--tt-blue);
}

.types button {
  padding: 0 14px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.chart-skeleton {
  height: 250px;
}

/* Колонка minmax(0, 1fr): иначе сетка растягивается под холст по умолчанию (300px)
   и график вылезает за карточку */
.chart-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  min-width: 0;
  padding: 16px 16px 14px;
}

.chart-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.chart-name {
  color: var(--tt-soft);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
}

.chart-value {
  display: grid;
  justify-items: end;
  gap: 4px;
  flex: none;
}

.chart-value b {
  color: var(--tt-ink);
  font-size: 22px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.chart-box {
  position: relative;
  height: 150px;
}

.chart-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--tt-line);
}

.forecast-btn {
  --tt-focus-ring: rgba(55, 96, 231, 0.4);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  margin: 0;
  padding: 0 14px;
  border: 1px solid rgba(55, 96, 231, 0.3);
  border-radius: var(--tt-radius-pill);
  background-color: var(--tt-blue-tint);
  color: var(--tt-blue-deep);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}

.forecast-btn:hover:not(:disabled) {
  border-color: var(--tt-blue);
  background-color: var(--tt-blue);
  color: #ffffff;
}

.forecast-btn:disabled {
  cursor: default;
  opacity: 0.55;
}

.forecast {
  display: grid;
  justify-items: end;
  gap: 2px;
}

.forecast-value {
  color: var(--tt-blue-deep);
  font-size: 15px;
  font-weight: 700;
}

.forecast-meta {
  color: var(--tt-muted);
  font-size: 11px;
}

@media (max-width: 1100px) {
  .overview {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 640px) {
  .summary-card {
    padding: 20px 20px 50px;
  }

  .kpi-value {
    font-size: 26px;
  }
}

@media (prefers-reduced-motion: reduce) {

  .kpi--skeleton,
  .summary-ecg path {
    animation: none;
  }

  .summary-ecg path {
    stroke-dashoffset: 0;
  }
}
</style>
