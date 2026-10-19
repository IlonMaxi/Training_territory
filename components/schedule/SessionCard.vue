<template>
    <article :class="['tt-card', 'tt-card--lift', 'session', { 'session--compact': compact }]" tabindex="0" role="button"
        :aria-label="`Тренировка ${session.workout_name}, ${start}–${end}`" @click="$emit('open')"
        @keydown.enter.prevent="$emit('open')">
        <div class="session-time">
            <span class="time-start">{{ start }}</span>
            <span class="time-end">{{ end }}</span>
        </div>

        <div class="session-body">
            <h4 class="session-title">{{ session.workout_name }}</h4>
            <!-- У тренера в карточке видно, с кем занятие -->
            <p v-if="session.client_names" class="session-client">
                <i class="fa-solid fa-user"></i> {{ session.client_names }}
            </p>
            <template v-if="!compact">
                <p v-if="session.location" class="session-line">
                    <i class="fa-solid fa-location-dot"></i> <span>{{ session.location }}</span>
                </p>
                <p v-if="session.exercise_name" class="session-line">
                    <i class="fa-solid fa-dumbbell"></i>
                    <span>{{ session.exercise_name }}<span v-if="session.equipment" class="equipment"> · {{ session.equipment }}</span></span>
                </p>
            </template>

            <!-- Действия (например, «Отменить» у тренера) не открывают подробности -->
            <div v-if="$slots.actions" class="session-actions" @click.stop @keydown.enter.stop>
                <slot name="actions" />
            </div>
        </div>

        <i v-if="!compact" class="fa-solid fa-chevron-right session-arrow" aria-hidden="true"></i>
    </article>
</template>

<script>
import { formatTime } from '@/components/utils/week.js';

export default {
    name: 'SessionCard',
    props: {
        session: { type: Object, required: true },
        // Компактный вид — для колонок режима «неделя»
        compact: { type: Boolean, default: false }
    },
    computed: {
        start() {
            return formatTime(this.session.starttime);
        },
        end() {
            return formatTime(this.session.endtime);
        }
    }
};
</script>

<style scoped>
/* Рамка, фон, тень и подъём при наведении — от .tt-card */
.session {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: start;
    gap: 16px;
    padding: 18px 18px 18px 22px;
    overflow: hidden;
    cursor: pointer;
}

/* Оранжевая полоска слева — тренировка; у питания она синяя */
.session::before {
    content: "";
    position: absolute;
    top: 14px;
    bottom: 14px;
    left: 0;
    width: 4px;
    border-radius: 0 4px 4px 0;
    background: linear-gradient(180deg, #ff7a3d, #f8500a);
}

.session-time {
    display: grid;
    gap: 2px;
    min-width: 54px;
    font-variant-numeric: tabular-nums;
}

.time-start {
    color: var(--tt-ink);
    font-size: 20px;
    font-weight: 700;
    line-height: 1.1;
}

.time-end {
    color: var(--tt-muted);
    font-size: 13px;
    font-weight: 500;
}

.session-body {
    display: grid;
    gap: 6px;
    min-width: 0;
}

.session-title {
    margin: 0;
    color: var(--tt-ink);
    font-size: 17px;
    font-weight: 700;
    line-height: 1.3;
}

.session-line {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin: 0;
    color: var(--tt-soft);
    font-size: 14px;
    line-height: 1.45;
}

.session-line i {
    width: 14px;
    color: var(--tt-brand);
    font-size: 12px;
    text-align: center;
}

.equipment {
    color: var(--tt-muted);
}

.session-client {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    margin: 0;
    color: var(--tt-blue-deep);
    font-size: 14px;
    font-weight: 600;
}

.session-client i {
    width: 14px;
    font-size: 12px;
    text-align: center;
}

.session-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 6px;
}

.session-arrow {
    align-self: center;
    color: var(--tt-muted);
    font-size: 13px;
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), color 0.3s ease;
}

.session:hover .session-arrow {
    color: var(--tt-brand);
    transform: translateX(3px);
}

/* ---------- компактный вид (неделя) ---------- */

.session--compact {
    grid-template-columns: minmax(0, 1fr);
    gap: 4px;
    padding: 10px 10px 10px 14px;
    border-radius: var(--tt-radius-md);
}

.session--compact::before {
    top: 10px;
    bottom: 10px;
    width: 3px;
}

.session--compact .session-time {
    display: flex;
    gap: 4px;
    min-width: 0;
}

.session--compact .time-start {
    font-size: 13px;
}

.session--compact .time-end {
    font-size: 12px;
}

.session--compact .time-end::before {
    content: "– ";
}

.session--compact .session-title {
    overflow: hidden;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.session--compact .session-client {
    display: block;
    overflow: hidden;
    font-size: 12px;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.session--compact .session-client i {
    display: none;
}

.session--compact:hover {
    transform: translateY(-2px);
}

/* На узком экране время встаёт строкой над названием — названию нужна ширина */
@media (max-width: 480px) {
    .session:not(.session--compact) {
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 8px 12px;
    }

    .session:not(.session--compact) .session-time {
        display: flex;
        grid-column: 1 / -1;
        align-items: baseline;
        gap: 6px;
    }

    .session:not(.session--compact) .time-start {
        font-size: 18px;
    }

    .session:not(.session--compact) .time-end::before {
        content: "– ";
    }
}

@media (prefers-reduced-motion: reduce) {
    .session-arrow {
        transition: none;
    }

    .session:hover,
    .session:hover .session-arrow {
        transform: none;
    }
}
</style>
