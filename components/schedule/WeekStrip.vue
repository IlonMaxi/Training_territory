<template>
    <div class="week-strip">
        <div class="strip-head">
            <div class="strip-range">
                <span class="strip-month">{{ monthLabel }}</span>
                <span class="strip-dates">{{ rangeLabel }}</span>
            </div>
            <div class="strip-controls">
                <!-- Сюда страница может добавить свои кнопки, например «день / неделя» -->
                <slot name="controls" />
                <button type="button" class="today-btn" :disabled="isCurrentWeek" @click="$emit('today')">
                    Сегодня
                </button>
                <button type="button" class="tt-icon-btn" aria-label="Предыдущая неделя" @click="$emit('prev')">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <button type="button" class="tt-icon-btn" aria-label="Следующая неделя" @click="$emit('next')">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>
        </div>

        <div class="days" role="tablist" aria-label="Дни недели">
            <button v-for="day in days" :key="day.key" type="button" role="tab"
                :aria-selected="day.selected ? 'true' : 'false'"
                :class="['tt-card', 'tt-card--lift', 'day', { 'is-selected': day.selected, 'is-today': day.today }]"
                @click="$emit('select', day.date)">
                <span class="day-name">{{ day.name }}</span>
                <span class="day-number">{{ day.number }}</span>
                <span class="day-dots" aria-hidden="true">
                    <span v-if="day.sessions" class="dot dot--session"></span>
                    <span v-if="day.meals" class="dot dot--meal"></span>
                </span>
            </button>
        </div>
    </div>
</template>

<script>
import { weekDays, isSameDay, startOfWeek } from '@/components/utils/week.js';
import { capitalize } from '@/components/utils/format.js';

export default {
    name: 'WeekStrip',
    props: {
        weekStart: { type: Date, required: true },
        selected: { type: Date, required: true },
        // (date) => { sessions, meals } — сколько событий в день, для точек под датой
        countFor: { type: Function, default: () => ({ sessions: 0, meals: 0 }) }
    },
    computed: {
        days() {
            const today = new Date();
            return weekDays(this.weekStart).map((date) => {
                const counts = this.countFor(date);
                return {
                    key: date.toDateString(),
                    date,
                    name: capitalize(date.toLocaleDateString('ru-RU', { weekday: 'short' })),
                    number: date.getDate(),
                    today: isSameDay(date, today),
                    selected: isSameDay(date, this.selected),
                    sessions: counts.sessions,
                    meals: counts.meals
                };
            });
        },
        isCurrentWeek() {
            return isSameDay(this.weekStart, startOfWeek(new Date()));
        },
        // «Октябрь 2026» или «Сентябрь — октябрь 2026», если неделя на стыке месяцев
        monthLabel() {
            const first = this.days[0].date;
            const last = this.days[6].date;
            const month = (date) => date.toLocaleDateString('ru-RU', { month: 'long' });
            const label = first.getMonth() === last.getMonth()
                ? month(first)
                : `${month(first)} — ${month(last)}`;
            return `${capitalize(label)} ${last.getFullYear()}`;
        },
        rangeLabel() {
            const format = (date) => date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
            return `${format(this.days[0].date)} — ${format(this.days[6].date)}`;
        }
    }
};
</script>

<style scoped>
.week-strip {
    display: grid;
    gap: 16px;
}

.strip-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.strip-range {
    display: grid;
    gap: 2px;
}

.strip-month {
    color: var(--tt-ink);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.01em;
}

.strip-dates {
    color: var(--tt-muted);
    font-size: 14px;
}

.strip-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
}

/* Стрелки не крутятся, как кнопка темы, а чуть сдвигаются */
.strip-controls .tt-icon-btn:hover {
    transform: none;
}

.today-btn {
    height: 42px;
    margin: 0;
    padding: 0 16px;
    border: 1px solid var(--tt-line-brand);
    border-radius: var(--tt-radius-pill);
    background-color: var(--tt-surface);
    color: var(--tt-ink);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}

.today-btn:hover:not(:disabled) {
    border-color: var(--tt-brand);
    background-color: var(--tt-brand-50);
    color: var(--tt-brand-deep);
}

.today-btn:disabled {
    cursor: default;
    opacity: 0.5;
}

.days {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 8px;
}

/* День — маленькая карточка (.tt-card): рамка, тень и подъём при наведении оттуда */
.day {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin: 0;
    padding: 12px 4px 10px;
    border-radius: var(--tt-radius-md);
    color: var(--tt-ink);
    cursor: pointer;
}

.day-name {
    color: var(--tt-muted);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.day-number {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
}

.day-dots {
    display: flex;
    gap: 4px;
    min-height: 6px;
}

.dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
}

.dot--session {
    background-color: var(--tt-brand);
}

.dot--meal {
    background-color: var(--tt-blue);
}

/* Сегодня — синим, это дополнительный цвет палитры */
.day.is-today .day-number {
    color: var(--tt-blue-deep);
}

.day.is-today::after {
    content: "";
    position: absolute;
    top: 8px;
    right: 8px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--tt-blue);
}

.day.is-selected {
    border-color: transparent;
    background: var(--tt-gradient-brand);
    box-shadow: 0 16px 30px -16px rgba(248, 80, 10, 0.9);
    color: #ffffff;
}

.day.is-selected .day-name,
.day.is-selected .day-number {
    color: #ffffff;
}

.day.is-selected .dot {
    background-color: rgba(255, 255, 255, 0.9);
}

.day.is-selected.is-today::after {
    background-color: #ffffff;
}

@media (max-width: 640px) {
    .days {
        gap: 4px;
    }

    .day {
        padding: 10px 2px 8px;
    }

    .day-number {
        font-size: 18px;
    }

    .day-name {
        font-size: 11px;
    }
}


</style>
