<template>
    <section class="tt-container hero" aria-labelledby="cabinet-title">
        <div class="hero-text">
            <Reveal :y="10" :duration="550">
                <span class="tt-eyebrow">
                    <i :class="isTrainer ? 'fa-solid fa-clipboard-user' : 'fa-solid fa-fire'"></i>
                    {{ isTrainer ? 'Кабинет тренера' : 'Личный кабинет' }}
                </span>
            </Reveal>

            <Reveal as="h1" id="cabinet-title" variant="wipe" class="hero-title" :y="8" :duration="650" :delay="60">
                Привет<template v-if="firstName">, <span class="accent-word">{{ firstName }}</span></template>!
            </Reveal>

            <Reveal as="p" class="hero-date" :y="8" :delay="100">
                <i class="fa-regular fa-calendar"></i> {{ todayLabel }}
            </Reveal>

            <Reveal as="p" class="hero-lead" :y="10" :delay="130">{{ lead }}</Reveal>

            <Reveal class="hero-actions" :y="18" :scale="0.98" :delay="180">
                <button v-for="(action, index) in actions" :key="action.key" type="button"
                    :class="['tt-btn', index === 0 ? 'tt-btn--primary' : 'tt-btn--ghost']" @click="run(action)">
                    <i :class="action.icon"></i> {{ action.label }}
                </button>
            </Reveal>
        </div>

        <!-- Сводка на сегодня -->
        <Reveal class="tt-dark today" variant="bubbleSoft" :duration="800" :delay="150">
            <svg class="today-dial" viewBox="0 0 200 200" aria-hidden="true">
                <line v-for="tick in ticks" :key="tick.key" :x1="tick.x1" :y1="tick.y1" :x2="tick.x2" :y2="tick.y2"
                    :class="['dial-tick', { 'dial-tick--major': tick.major }]" />
            </svg>

            <div class="today-head">
                <span class="today-label"><span class="pulse" aria-hidden="true"></span> Сегодня</span>
                <span class="today-chip">{{ shortDate }}</span>
            </div>

            <div v-if="loading" class="today-loading" aria-label="Загрузка">
                <span></span><span></span><span></span>
            </div>

            <!-- Тренер: занятия дня -->
            <template v-else-if="isTrainer">
                <div class="tt-dark-tile today-block">
                    <div class="big-number">{{ todaySessions.length }}</div>
                    <div class="big-caption">{{ sessionsWord(todaySessions.length) }} сегодня</div>
                </div>
                <ul v-if="todaySessions.length" class="today-list">
                    <li v-for="session in todaySessions.slice(0, 3)" :key="session.scheduleid" class="tt-dark-tile">
                        <span class="list-time">{{ time(session.starttime) }}</span>
                        <span class="list-title">{{ session.workout_name }}</span>
                        <span class="list-meta">{{ session.client_names || session.location }}</span>
                    </li>
                </ul>
                <p v-else class="today-note">Свободный день — можно назначить тренировки клиентам.</p>
                <div class="today-foot">
                    На этой неделе: <b>{{ weekSessions }}</b> {{ sessionsWord(weekSessions) }}
                </div>
            </template>

            <!-- Клиент: тренировка и питание дня -->
            <template v-else>
                <div class="tt-dark-tile today-block">
                    <span class="block-label"><i class="fa-solid fa-dumbbell"></i> Тренировка</span>
                    <template v-if="nextSession">
                        <div class="session-line">
                            <span class="big-time">{{ time(nextSession.starttime) }}</span>
                            <span class="session-name">{{ nextSession.workout_name }}</span>
                        </div>
                        <p v-if="nextSession.location" class="today-note">
                            <i class="fa-solid fa-location-dot"></i> {{ nextSession.location }}
                            <span v-if="todaySessions.length > 1"> · ещё {{ todaySessions.length - 1 }}</span>
                        </p>
                    </template>
                    <p v-else class="today-note">Тренировок нет — день восстановления тоже часть прогресса.</p>
                </div>

                <div class="tt-dark-tile today-block">
                    <span class="block-label"><i class="fa-solid fa-utensils"></i> Питание</span>
                    <template v-if="todayMeals.length">
                        <div class="kcal"><b>{{ kcal }}</b> ккал за {{ todayMeals.length }} {{ mealsWord(todayMeals.length) }}</div>
                        <div class="macros">
                            <div v-for="macro in macros" :key="macro.key" class="macro">
                                <span class="macro-name">{{ macro.label }}</span>
                                <span class="macro-bar"><span :style="{ width: `${macro.share}%` }"></span></span>
                                <span class="macro-value">{{ macro.grams }} г</span>
                            </div>
                        </div>
                    </template>
                    <p v-else class="today-note">Рацион на сегодня ещё не составлен.</p>
                </div>
            </template>

            <svg class="today-ecg" viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true">
                <path class="ecg-line" pathLength="1" d="M0 30 L118 30 L128 22 L136 36 L148 6 L160 38 L168 26 L176 30 L300 30" />
            </svg>
        </Reveal>
    </section>
</template>

<script>
import Reveal from '@/components/ui/Reveal.vue';
import { isSameDay, startOfWeek, addDays, byStartTime, formatTime, toDate } from '@/components/utils/week.js';
import { safePush } from '@/components/utils/cabinet.js';
import { plural, capitalize } from '@/components/utils/format.js';

export default {
    name: 'CabinetHero',
    components: { Reveal },
    props: {
        user: { type: Object, default: null },
        // client | trainer
        role: { type: String, default: 'client' },
        sessions: { type: Array, default: () => [] },
        meals: { type: Array, default: () => [] },
        loading: { type: Boolean, default: false }
    },
    data() {
        // Деления секундомера в углу карточки
        const ticks = Array.from({ length: 40 }, (_, index) => {
            const angle = (index * 9 - 90) * Math.PI / 180;
            const major = index % 5 === 0;
            const point = (radius) => [
                Math.round((100 + radius * Math.cos(angle)) * 10) / 10,
                Math.round((100 + radius * Math.sin(angle)) * 10) / 10
            ];
            const [x1, y1] = point(major ? 78 : 84);
            const [x2, y2] = point(92);
            return { key: index, major, x1, y1, x2, y2 };
        });
        return { ticks, now: new Date() };
    },
    computed: {
        isTrainer() {
            return this.role === 'trainer';
        },
        firstName() {
            return this.user && this.user.first_name;
        },
        todayLabel() {
            return capitalize(this.now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }));
        },
        shortDate() {
            return this.now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        },
        lead() {
            return this.isTrainer
                ? 'Расписание занятий, назначение тренировок и ваши клиенты — в одном кабинете.'
                : 'Тренировки от тренера, рацион на каждый день и замеры тела — всё под рукой.';
        },
        actions() {
            return this.isTrainer
                ? [
                    { key: 'schedule', label: 'Расписание', icon: 'fa-solid fa-calendar-days', section: 'schedule' },
                    { key: 'assign', label: 'Назначить тренировку', icon: 'fa-solid fa-calendar-plus', section: 'assign' },
                    { key: 'clients', label: 'Клиенты', icon: 'fa-solid fa-users', route: { path: '/Profile', query: { menu: 'clients' } } }
                ]
                : [
                    { key: 'schedule', label: 'План на неделю', icon: 'fa-solid fa-calendar-days', section: 'schedule' },
                    { key: 'progress', label: 'Внести замеры', icon: 'fa-solid fa-ruler', section: 'progress' },
                    { key: 'profile', label: 'Мой прогресс', icon: 'fa-solid fa-chart-line', route: { path: '/Profile', query: { menu: 'progress' } } }
                ];
        },
        todaySessions() {
            return this.sessions.filter(s => isSameDay(s.date, this.now)).sort(byStartTime);
        },
        // Ближайшая ещё не закончившаяся тренировка, иначе — первая за день
        nextSession() {
            const clock = this.now.toTimeString().slice(0, 5);
            return this.todaySessions.find(s => formatTime(s.endtime) >= clock) || this.todaySessions[0] || null;
        },
        weekSessions() {
            const start = startOfWeek(this.now);
            const end = addDays(start, 7);
            return this.sessions.filter(s => {
                const date = toDate(s.date);
                return date >= start && date < end;
            }).length;
        },
        todayMeals() {
            return this.meals.filter(m => isSameDay(m.food_date, this.now));
        },
        kcal() {
            return this.todayMeals.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0);
        },
        // Доли белков, жиров и углеводов — для полосок под калориями
        macros() {
            const sum = (field) => Math.round(this.todayMeals.reduce((total, meal) => total + (Number(meal[field]) || 0), 0));
            const list = [
                { key: 'p', label: 'Б', grams: sum('proteins') },
                { key: 'f', label: 'Ж', grams: sum('fats') },
                { key: 'c', label: 'У', grams: sum('carbohydrates') }
            ];
            const max = Math.max(...list.map(item => item.grams), 1);
            return list.map(item => ({ ...item, share: Math.round((item.grams / max) * 100) }));
        }
    },
    methods: {
        time: formatTime,
        sessionsWord(n) {
            return plural(n, ['тренировка', 'тренировки', 'тренировок']);
        },
        mealsWord(n) {
            return plural(n, ['приём пищи', 'приёма пищи', 'приёмов пищи']);
        },
        run(action) {
            if (action.route) {
                safePush(this.$router, action.route);
                return;
            }
            const target = document.getElementById(action.section);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
};
</script>

<style scoped>
.hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 440px);
    align-items: center;
    gap: 40px;
}

.hero-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
}

.hero-title {
    margin: 0;
    color: var(--tt-ink);
    font-size: 56px;
    font-weight: 600;
    line-height: 1.05;
    letter-spacing: -0.03em;
}

.hero-date {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    color: var(--tt-blue-deep);
    font-size: 16px;
    font-weight: 600;
}

.hero-lead {
    max-width: 520px;
    margin: 0;
    color: var(--tt-soft);
    font-size: 17px;
    line-height: 1.6;
}

.hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding-top: 6px;
}

.hero-actions .tt-btn {
    min-height: 48px;
    padding: 0 22px;
    font-size: 15px;
}

/* ---------- карточка «Сегодня» ---------- */

/* Фон, свечение и скругление — от .tt-dark */
.today {
    display: grid;
    gap: 18px;
    padding: 28px 28px 22px;
}

.today-dial {
    position: absolute;
    top: -70px;
    right: -70px;
    width: 220px;
    height: 220px;
    pointer-events: none;
    animation: dial-spin 60s linear infinite;
}

.dial-tick {
    stroke: rgba(255, 255, 255, 0.18);
    stroke-width: 1.4;
    stroke-linecap: round;
}

.dial-tick--major {
    stroke: rgba(255, 138, 76, 0.75);
    stroke-width: 2.2;
}

@keyframes dial-spin {
    to {
        transform: rotate(360deg);
    }
}

.today-head {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.today-label {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

/* Пульсирующая точка «сейчас» */
.pulse {
    position: relative;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background-color: #ff7a3d;
}

.pulse::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid #ff7a3d;
    animation: pulse-wave 1.8s ease-out infinite;
}

@keyframes pulse-wave {
    from {
        opacity: 0.9;
        transform: scale(1);
    }

    to {
        opacity: 0;
        transform: scale(2.6);
    }
}

.today-chip {
    padding: 4px 12px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: var(--tt-radius-pill);
    background-color: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.85);
    font-size: 13px;
    font-weight: 600;
}

.today-block {
    position: relative;
    display: grid;
    gap: 8px;
    padding: 16px;
}

.block-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #ff9a66;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.session-line {
    display: flex;
    align-items: baseline;
    gap: 12px;
    min-width: 0;
}

.big-time {
    font-size: 30px;
    font-weight: 700;
    line-height: 1;
    font-variant-numeric: tabular-nums;
}

.session-name {
    overflow: hidden;
    font-size: 17px;
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.today-note {
    margin: 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    line-height: 1.5;
}

.kcal {
    color: rgba(255, 255, 255, 0.75);
    font-size: 14px;
}

.kcal b {
    color: #ffffff;
    font-size: 26px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
}

.macros {
    display: grid;
    gap: 8px;
}

.macro {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) 52px;
    align-items: center;
    gap: 10px;
    font-size: 13px;
}

.macro-name {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 700;
}

.macro-bar {
    height: 6px;
    overflow: hidden;
    border-radius: var(--tt-radius-pill);
    background-color: rgba(255, 255, 255, 0.1);
}

/* Полоски вырастают, когда карточка проявилась */
.macro-bar span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #5a7cf0, #8aa4ff);
    transform: scaleX(0);
    transform-origin: left center;
}

[data-sr-revealed="true"] .macro-bar span {
    animation: bar-grow 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.5s forwards;
}

@keyframes bar-grow {
    to {
        transform: scaleX(1);
    }
}

.macro-value {
    color: rgba(255, 255, 255, 0.85);
    font-weight: 600;
    text-align: right;
    font-variant-numeric: tabular-nums;
}

.big-number {
    font-size: 54px;
    font-weight: 700;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    background: linear-gradient(135deg, #ffb38a, #ff7a3d 50%, #f8500a);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.big-caption {
    color: rgba(255, 255, 255, 0.75);
    font-size: 15px;
    font-weight: 600;
}

.today-list {
    position: relative;
    display: grid;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
}

.today-list li {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr);
    gap: 2px 12px;
    padding: 12px 14px;
}

.list-time {
    grid-row: span 2;
    align-self: center;
    color: #ff9a66;
    font-size: 17px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
}

.list-title {
    overflow: hidden;
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.list-meta {
    overflow: hidden;
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.today-foot {
    position: relative;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
}

.today-foot b {
    color: #ffffff;
}

.today-loading {
    display: grid;
    gap: 10px;
}

.today-loading span {
    height: 54px;
    border-radius: var(--tt-radius-md);
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.05) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
    from {
        background-position: 100% 0;
    }

    to {
        background-position: -100% 0;
    }
}

/* Кардиограмма внизу карточки прорисовывается при появлении */
.today-ecg {
    width: 100%;
    height: 34px;
    margin-top: -6px;
}

.ecg-line {
    fill: none;
    stroke: #ff7a3d;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    vector-effect: non-scaling-stroke;
}

[data-sr-revealed="true"] .ecg-line {
    animation: ecg-draw 1.6s cubic-bezier(0.65, 0, 0.35, 1) 0.6s forwards;
}

@keyframes ecg-draw {
    to {
        stroke-dashoffset: 0;
    }
}

@media (max-width: 1024px) {
    .hero {
        grid-template-columns: minmax(0, 1fr);
    }

    .today {
        max-width: 560px;
    }
}

@media (max-width: 640px) {
    .hero-title {
        font-size: 38px;
    }

    .hero-actions .tt-btn {
        width: 100%;
    }

    .today {
        padding: 22px 20px 18px;
    }
}

@media (prefers-reduced-motion: reduce) {

    .today-dial,
    .pulse::after,
    .today-loading span {
        animation: none;
    }

    .macro-bar span {
        animation: none !important;
        transform: none;
    }

    .ecg-line {
        animation: none !important;
        stroke-dashoffset: 0;
    }
}
</style>
