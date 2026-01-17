<template>
  <div class="user-menu">
    <!-- Фото пользователя -->
    <div class="user-card">
      <div class="user-image">
        <img :src="photoUrl" alt="Фото пользователя" />
      </div>
    </div>

    <!-- Прогресс -->
    <div class="progress-card">
      <div class="progress-ring-container">
        <svg viewBox="0 0 36 36" class="progress-ring">
          <circle class="circle-track" cx="18" cy="18" r="15.9155" />
          <circle class="circle-segment" cx="18" cy="18" r="15.9155"
            stroke-dasharray="22, 6, 22, 6, 22, 6, 22, 6" />
          <text x="18" y="16" class="ring-title">СТАНОВИСЬ ЛУЧШЕ С</text>
          <text x="18" y="24" class="ring-subtitle">TT</text>
        </svg>
      </div>

      <div class="progress-data-blocks" v-if="progress">
        <div class="progress-details">
  <div>Прогресс веса: {{ progress['Вес'] }}%</div>
  <div>Жировая масса: {{ progress['Жировая масса'] }}%</div>
  <div>Мышечная масса: {{ progress['Мышечная масса'] }}%</div>
  <div>Содержание воды: {{ progress['Содержание воды'] }}%</div>
  <div>ИМТ: {{ progress['ИМТ'] }}%</div>
  <div>Метаболизм: {{ progress['Метаболизм'] }}%</div>
  <div>Возраст тела: {{ progress['Возраст тела'] }}%</div>
  <div>Процент жира: {{ progress['Процент жира'] }}%</div>
  <div>Динамика мышц: {{ progress['Динамика мышц'] }}%</div>
</div>

<div class="progress-analysis">
  <h4>Анализ последнего прогресса</h4>
  <p><strong>Мышечный анализ:</strong> {{ progress['Анализ замеров'] || '—' }}</p>
  <p><strong>Весовой анализ:</strong> {{ progress['Анализ веса'] || '—' }}</p>
  <p><strong>Общий анализ массы:</strong> {{ progress['Полный анализ замеров'] || '—' }}</p>
  <p><strong>Общий анализ веса:</strong> {{ progress['Полный анализ веса'] || '—' }}</p>
</div>

      </div>

      <!-- Кнопки -->
      <div style="display: flex; gap: 10px; margin: 12px 0; flex-wrap: wrap;">
        <button class="unit-toggle" @click="loadAndSet('unit')">Прогресс в единицах</button>
        <button class="unit-toggle" @click="loadAndSet('percentage')">Прогресс в процентах</button>
        <button class="unit-toggle" @click="loadAndSet('kg')">Прогресс в килограммах</button>
        <button class="unit-toggle" @click="loadAndSet('cm_upper')">Обхваты: верх</button>
        <button class="unit-toggle" @click="loadAndSet('cm_arms')">Обхваты: руки</button>
        <button class="unit-toggle" @click="loadAndSet('cm_legs')">Обхваты: ноги</button>
      </div>

      <!-- Блок с графиками -->
      <div v-if="currentType && currentHistory.length" class="unit-graphs">
        <h3 class="unit-title">Прогресс: {{ typeLabels[currentType] }}</h3>
        <div class="unit-grid">
          <div v-for="param in currentParams" :key="param" class="unit-card">
            <div class="unit-header">
              <div class="unit-name">{{ paramLabels[param] }}</div>
              <div class="unit-value">
                {{ getLast(param) }}
                <span :class="{ 'up': getTrend(param) > 0, 'down': getTrend(param) < 0 }">
                  {{ getTrend(param) > 0 ? '↑' : getTrend(param) < 0 ? '↓' : '' }}
                  {{ Math.abs(getTrend(param)) }}%</span>
              </div>
            </div>
            <canvas :ref="param + 'Chart'" style="height: 100px; width: 100%;"></canvas>
            <button class="forecast-btn" @click="predictFor(param)" :disabled="predicting[param]">
              {{ predicting[param] ? 'Считаю...' : 'Прогноз на 4 недели' }}
            </button>
            <div v-if="predictions[param] !== undefined" class="forecast-result">
              Прогноз: {{ Number(predictions[param]).toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js';

export default {
    name: 'UserMenu',
    data() {
            return {
                user: { imageUrl: '' },
                progress: null,
                currentType: null,
                currentHistory: [],
                predictions: {},
                predicting: {},
                predictionSeries: {},
                charts: {},
                paramLabels: {
                // Measurements_in_units
                bmi: 'BMI',
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
                kg: [
                    'weight', 'fat_mass', 'skeletal_mass', 'muscle_mass',
                    'water_content', 'bone_mass', 'lbm'
                ],
                percentage: [
                    'fat_percentage', 'skeletal_mass_percentage', 'muscle_dynamics',
                    'body_water', 'protein', 'fat_content'
                ],
                cm_upper: [
                    'chest_circumference', 'waist_circumference',
                    'neck_circumference', 'waist_inhale_circumference'
                ],
                cm_arms: [
                    'bicep_circumference', 'forearm_circumference'
                ],
                cm_legs: [
                    'hip_circumference', 'thigh_circumference',
                    'calf_circumference', 'quadriceps_circumference'
                ]
            },
            typeLabels: {
                unit: 'в единицах',
                percentage: 'в процентах',
                kg: 'в килограммах',
                cm_upper: 'обхваты (верх)',
                cm_arms: 'обхваты (руки)',
                cm_legs: 'обхваты (ноги)'
            }
        };
    },
    computed: {
        photoUrl() {
            return this.user.imageUrl
                ? `/api/uploads/${this.user.imageUrl}`
                : '/api/uploads/default.jpg';
        },
        currentParams() {
            return this.currentType ? this.typeParams[this.currentType] : [];
        }
    },
    methods: {
        getLast(param) {
            return this.currentHistory.length ? this.currentHistory.at(-1)[param] : '-';
        },
        getTrend(param) {
            if (this.currentHistory.length < 2) return 0;
            const first = this.currentHistory[0][param];
            const last = this.currentHistory.at(-1)[param];
            return Math.round(((last - first) / first) * 100);
        },
        loadAndSet(type) {
            this.currentType = type;
            const cookies = document.cookie.split('; ').reduce((acc, c) => {
                const [key, val] = c.split('=');
                acc[key] = decodeURIComponent(val);
                return acc;
            }, {});
            const user = JSON.parse(cookies.user || '{}');
            if (!user.clientid) return;

            const sourceType = type.startsWith('cm_') ? 'cm' : type;
            fetch(`/api/clients/${user.clientid}/${sourceType}-measurements-history`)
                .then(res => res.json())
                .then(data => {
                    this.currentHistory = data;
                    this.$nextTick(() => this.renderCharts());
                });
        },
        renderCharts() {
            this.currentParams.forEach(param => {
                const ctx = this.$refs[param + 'Chart'];
                if (ctx) {
                    const values = this.currentHistory.map(e => e[param]);
                    const max = Math.max(...values);
                    const min = Math.min(...values);
                    const range = max - min || Math.max(Math.abs(max), 1);
                    const pad = range * 0.08;
                    const forecast = this.predictionSeries[param] || [];
                    const forecastValues = forecast.map(point => point.value);
                    const historyLen = values.length;
                    const forecastLen = forecastValues.length;
                    const historyLabels = this.currentHistory.map(item => {
                        if (item?.date) return item.date;
                        return '';
                    });
                    const forecastLabels = forecast.map(point => point.date || '');
                    const labels = [...historyLabels, ...forecastLabels];
                    const historyData = [
                        ...values,
                        ...Array(forecastLen).fill(null)
                    ];
                    const forecastData = [
                        ...Array(historyLen).fill(null),
                        ...forecastValues
                    ];
                    if (this.charts[param]) {
                        this.charts[param].destroy();
                    }
                    const chart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels,
                            datasets: [{
                                data: historyData,
                                borderColor: '#f15a29',
                                backgroundColor: 'transparent',
                                fill: false,
                                borderWidth: 2,
                                pointRadius: 0,
                                pointHoverRadius: 0
                            },
                            ...(forecastLen ? [{
                                data: forecastData,
                                borderColor: '#f7a98d',
                                backgroundColor: 'transparent',
                                fill: false,
                                borderWidth: 2,
                                borderDash: [4, 3],
                                pointRadius: 0,
                                pointHoverRadius: 0
                            }] : [])
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            legend: { display: false },
                            tooltips: { enabled: false },
                            layout: {
                                padding: { top: 10, bottom: 6, left: 0, right: 0 }
                            },
                            scales: {
                                xAxes: [{
                                    display: true,
                                    gridLines: { display: false },
                                    ticks: {
                                        autoSkip: true,
                                        maxTicksLimit: 3,
                                        fontSize: 9,
                                        fontColor: '#999',
                                        callback: (val) => val ? String(val).slice(5) : ''
                                    }
                                }],
                                yAxes: [{
                                    display: true,
                                    gridLines: { display: false, drawBorder: false },
                                    ticks: {
                                        fontSize: 9,
                                        fontColor: '#999',
                                        padding: 6,
                                        suggestedMax: max + pad,
                                        suggestedMin: min - pad,
                                        maxTicksLimit: 3
                                    }
                                }]
                            },
                            elements: {
                                point: { radius: 0 },
                                line: { tension: 0.35 }
                            },
                            animation: { duration: 0 }
                        }
                    });
                    this.charts[param] = chart;
                }
            });
        }
        ,
        async predictFor(param) {
            if (!this.currentHistory.length) return;
            const series = this.currentHistory
                .map(item => ({
                    date: item.date,
                    value: item[param]
                }))
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
                    const value = data?.predicted?.value;
                    this.$set(this.predictions, param, value);
                    this.$set(this.predictionSeries, param, data?.series || []);
                    this.$nextTick(() => this.renderCharts());
                }
            } catch (error) {
                console.error('Ошибка при прогнозе:', error);
            } finally {
                this.$set(this.predicting, param, false);
            }
        }
    },
    mounted() {
        const cookies = document.cookie.split('; ').reduce((acc, c) => {
            const [key, val] = c.split('=');
            acc[key] = decodeURIComponent(val);
            return acc;
        }, {});
        const user = JSON.parse(cookies.user || '{}');
        if (!user.clientid) return;

        fetch(`/api/clients/${user.clientid}`)
            .then(res => res.json())
            .then(data => this.user = data);

        fetch(`/api/clients/${user.clientid}/progress-summary`)
            .then(res => res.json())
            .then(data => this.progress = data);
    }
};
</script>

<style scoped>
.user-menu {
    display: flex;
    gap: 24px;
    padding: 16px;
    margin: 0;
    width: 100%;
    align-items: stretch;
}

.user-card {
    background: var(--background-color-white);
    border-radius: 12px;
    width: 320px;
    height: 320px;
    flex-shrink: 0;
}

.user-image {
    width: 100%;
    height: 100%;
    background: var(--button-border-color);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.user-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.unit-card canvas {
    height: 170px !important;
    width: 100% !important;
}

.progress-card {
    background: linear-gradient(135deg, #f15a29, #f7941e); /* оставлен как просили */
    border-radius: 16px;
    color: var(--background-color-white);
    flex-grow: 1;
    padding: 28px;
    width: 100%;
    max-width: none;
}

.progress-ring-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.progress-ring {
    width: 160px;
    height: 160px;
    transform: rotate(-90deg);
}

.circle-track {
    fill: none;
    stroke: rgba(255, 255, 255, 0.2);
    stroke-width: 3.8;
}

.circle-segment {
    fill: none;
    stroke: white;
    stroke-width: 3.8;
    stroke-linecap: round;
}

.ring-title {
    fill: white;
    font-size: 0.14em;
    text-anchor: middle;
    transform: rotate(90deg);
    transform-origin: center;
}

.ring-subtitle {
    fill: white;
    font-size: 0.45em;
    font-weight: bold;
    text-anchor: middle;
    transform: rotate(90deg);
    transform-origin: center;
}

.progress-data-blocks {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
}

.progress-details {
    font-size: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
    flex: 1;
    min-width: 300px;
    font-weight: bold;
}

.progress-details div {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 4px;
}

.progress-analysis {
  flex: 1;
  min-width: 300px;
  background-color: var(--background-color-white);
  padding: 10px 20px;
  border-radius: 8px;
  color: var(--button-hover-color);
  font-weight: 500;
  border: 1px solid var(--button-hover-color);
}

.progress-analysis h4 {
  margin-bottom: 10px;
  color: var(--button-hover-color);
  font-size: 20px;
    font-weight: bold;
}

.unit-toggle {
    margin: 12px auto;
    padding: 8px 16px;
    background: var(--background-color-white);
    color: var(--button-hover-color);
    font-weight: bold;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s, color 0.3s;
}

.unit-toggle:hover {
    background-color: var(--button-hover-color);
    color: var(--button-hover-color-white);
}

.unit-graphs {
    background: var(--background-color-white);
    padding: 16px;
    border-radius: 12px;
}

.unit-title {
    text-align: center;
    font-weight: bold;
    color: var(--button-hover-color);
    margin-bottom: 16px;
}

.unit-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    align-items: stretch;
}

.unit-card {
    background: var(--background-color-white);
    border-radius: 12px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    padding: 16px;
    font-size: 15px;
}

.forecast-btn {
    margin-top: 8px;
    width: 100%;
    padding: 6px 8px;
    background: var(--button-hover-color);
    color: var(--button-hover-color-white);
    border: none;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
}

.forecast-btn:disabled {
    opacity: 0.7;
    cursor: default;
}

.forecast-result {
    margin-top: 6px;
    font-size: 12px;
    color: var(--text-color);
    font-weight: 600;
}

.unit-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-weight: bold;
    color: var(--text-color);
}

.unit-value span {
    font-size: 12px;
    margin-left: 4px;
}

.unit-value .up {
    color: green;
}

.unit-value .down {
    color: red;
}
</style>

