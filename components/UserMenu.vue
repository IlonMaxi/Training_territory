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

            <div class="progress-details" v-if="progress">
                <div>Прогресс веса: {{ progress.weight }}%</div>
                <div>Жировая масса: {{ progress.fat_mass }}%</div>
                <div>Мышечная масса: {{ progress.muscle_mass }}%</div>
                <div>Содержание воды: {{ progress.water_content }}%</div>
                <div>BMI: {{ progress.bmi }}%</div>
                <div>Метаболизм: {{ progress.metabolism }}%</div>
                <div>Возраст тела: {{ progress.body_age }}%</div>
                <div>Процент жира: {{ progress.fat_percentage }}%</div>
                <div>Динамика мышц: {{ progress.muscle_dynamics }}%</div>
                <div>Объёмы тела (см): {{ progress.cm }}%</div>
            </div>

            <!-- Кнопки -->
            <div style="display: flex; gap: 10px; flex-wrap: wrap; margin: 12px 0;">
                <button class="unit-toggle" @click="loadAndSet('unit')">Прогресс в единицах</button>
                <button class="unit-toggle" @click="loadAndSet('percentage')">Прогресс в процентах</button>
                <button class="unit-toggle" @click="loadAndSet('kg')">Прогресс в килограммах</button>
                <button class="unit-toggle" @click="loadAndSet('cm')">Прогресс в сантиметрах</button>
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
                                    {{ getTrend(param) > 0 ? '↑' : getTrend(param) < 0 ? '↓' : '' }} {{
                                        Math.abs(getTrend(param)) }}% </span>
                            </div>
                        </div>
                        <canvas :ref="param + 'Chart'" style="height: 100px; width: 100%;"></canvas>
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
    cm: [
        'chest_circumference', 'waist_circumference', 'hip_circumference',
        'bicep_circumference', 'forearm_circumference', 'quadriceps_circumference',
        'calf_circumference', 'thigh_circumference', 'neck_circumference',
        'waist_inhale_circumference'
    ]
},
            typeLabels: {
                unit: 'в единицах',
                percentage: 'в процентах',
                kg: 'в килограммах',
                cm: 'в сантиметрах'
            }
        };
    },
    computed: {
        photoUrl() {
            return this.user.imageUrl
                ? `http://26.100.29.243:3000/api/uploads/${this.user.imageUrl}`
                : 'http://26.100.29.243:3000/api/uploads/default.jpg';
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

            fetch(`http://26.100.29.243:3000/api/clients/${user.clientid}/${type}-measurements-history`)
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
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: this.currentHistory.map(() => ''),
                            datasets: [{
                                data: this.currentHistory.map(e => e[param]),
                                borderColor: '#f15a29',
                                backgroundColor: 'transparent',
                                fill: false,
                                borderWidth: 2,
                                pointRadius: 0,
                                pointHoverRadius: 0
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            legend: { display: false },
                            tooltips: { enabled: false },
                            scales: {
                                xAxes: [{
                                    display: false,
                                    gridLines: { display: false },
                                    ticks: { display: false }
                                }],
                                yAxes: [{
                                    display: false,
                                    gridLines: { display: false },
                                    ticks: { display: false }
                                }]
                            },
                            elements: {
                                point: { radius: 0 },
                                line: { tension: 0.4 }
                            },
                            animation: { duration: 0 }
                        }
                    });
                }
            });
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

        fetch(`http://26.100.29.243:3000/api/clients/${user.clientid}`)
            .then(res => res.json())
            .then(data => this.user = data);

        fetch(`http://26.100.29.243:3000/api/clients/${user.clientid}/progress-summary`)
            .then(res => res.json())
            .then(data => this.progress = data);
    }
};
</script>

<style scoped>
.user-menu {
    display: flex;
    gap: 32px;
    padding: 16px;
    margin: auto;
}

.user-card {
    background: var(--background-color-white);
    border-radius: 12px;
    width: 300px;
    height: 300px;
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
    height: 70px !important;
    width: 100% !important;
}

.progress-card {
    background: linear-gradient(135deg, #f15a29, #f7941e);
    /* можно заменить на переменные при желании */
    border-radius: 16px;
    color: var(--background-color-white);
    flex-grow: 1;
    padding: 24px;
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

.progress-details {
    font-size: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
}

.progress-details div {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 4px;
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
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
}

.unit-card {
    background: var(--background-color-white);
    border-radius: 12px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
    width: 200px;
    padding: 12px;
    font-size: 14px;
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