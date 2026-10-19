<template>
    <!-- Режим «неделя»: семь колонок, клик по заголовку открывает день -->
    <div class="week-grid">
        <div v-for="day in days" :key="day.key"
            :class="['tt-tile', 'week-col', { 'is-today': day.today, 'is-selected': day.selected }]">
            <button type="button" class="week-col-head" @click="$emit('open', day.date)">
                <span>{{ day.name }}</span>
                <b>{{ day.number }}</b>
            </button>
            <slot :date="day.date" />
            <span v-if="day.empty" class="week-empty">{{ emptyText }}</span>
        </div>
    </div>
</template>

<script>
import { weekDays, isSameDay } from '@/components/utils/week.js';

// Общая сетка недели для расписаний клиента и тренера: что показать в дне,
// решает страница через слот (получает date)
export default {
    name: 'WeekGrid',
    props: {
        weekStart: { type: Date, required: true },
        selected: { type: Date, required: true },
        // (date) => { sessions, meals } — по нему понимаем, что день пустой
        countFor: { type: Function, default: () => ({ sessions: 0, meals: 0 }) },
        emptyText: { type: String, default: 'Нет событий' }
    },
    computed: {
        days() {
            const today = new Date();
            return weekDays(this.weekStart).map((date) => {
                const counts = this.countFor(date);
                return {
                    key: date.toDateString(),
                    date,
                    name: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
                    number: date.getDate(),
                    today: isSameDay(date, today),
                    selected: isSameDay(date, this.selected),
                    empty: !(counts.sessions || counts.meals)
                };
            });
        }
    }
};
</script>

<style scoped>
.week-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 10px;
}

.week-col {
    display: grid;
    align-content: start;
    gap: 8px;
    min-width: 0;
    padding: 10px;
    border-radius: var(--tt-radius-lg);
}

.week-col.is-today {
    border-color: rgba(55, 96, 231, 0.35);
}

.week-col.is-selected {
    border-color: rgba(248, 80, 10, 0.45);
}

.week-col-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin: 0 0 2px;
    padding: 4px 6px;
    border: 0;
    border-radius: var(--tt-radius-sm);
    background: transparent;
    color: var(--tt-muted);
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
}

.week-col-head b {
    color: var(--tt-ink);
    font-size: 18px;
}

.week-col-head:hover {
    background-color: var(--tt-brand-tint);
    color: var(--tt-brand-deep);
}

.week-col.is-today .week-col-head b {
    color: var(--tt-blue-deep);
}

.week-empty {
    padding: 8px 6px;
    color: var(--tt-muted);
    font-size: 12px;
}

@media (max-width: 1100px) {
    .week-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}

@media (max-width: 900px) {
    .week-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 640px) {
    .week-grid {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
