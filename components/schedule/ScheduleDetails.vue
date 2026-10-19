<template>
    <transition name="tt-modal" :duration="{ enter: 450, leave: 200 }">
        <div v-if="item" class="tt-modal-overlay" @click.self="$emit('close')">
            <div class="tt-modal details" role="dialog" aria-modal="true" aria-labelledby="details-title">
                <button type="button" class="tt-modal-close" aria-label="Закрыть" @click="$emit('close')">
                    <i class="fa-solid fa-xmark"></i>
                </button>

                <!-- Тренировка -->
                <template v-if="type === 'session'">
                    <span class="tt-eyebrow"><i class="fa-solid fa-dumbbell"></i> Тренировка</span>
                    <h2 id="details-title" class="tt-modal-title">{{ item.workout_name }}</h2>

                    <div class="chips">
                        <span class="tt-chip"><i class="fa-regular fa-clock"></i> {{ time(item.starttime) }}–{{ time(item.endtime) }}</span>
                        <span v-if="item.location" class="tt-chip tt-chip--muted">
                            <i class="fa-solid fa-location-dot"></i> {{ item.location }}
                        </span>
                        <span v-if="item.client_names" class="tt-chip tt-chip--blue">
                            <i class="fa-solid fa-user"></i> {{ item.client_names }}
                        </span>
                    </div>

                    <p v-if="item.workout_description" class="text">{{ item.workout_description }}</p>

                    <div v-if="item.exercise_name" class="tt-tile block">
                        <span class="block-label">Упражнение</span>
                        <p class="block-title">{{ item.exercise_name }}</p>
                        <p v-if="item.exercise_description" class="text">{{ item.exercise_description }}</p>
                        <p v-if="item.equipment" class="muted"><i class="fa-solid fa-gears"></i> {{ item.equipment }}</p>
                    </div>
                </template>

                <!-- Питание -->
                <template v-else>
                    <span class="tt-eyebrow tt-eyebrow--blue"><i class="fa-solid fa-utensils"></i> {{ item.meal_type }}</span>
                    <h2 id="details-title" class="tt-modal-title">{{ item.food_name }}</h2>

                    <div class="macros">
                        <div class="macro macro--kcal">
                            <b>{{ item.calories }}</b>
                            <span>ккал</span>
                        </div>
                        <div class="macro">
                            <b>{{ round(item.proteins) }}</b>
                            <span>белки, г</span>
                        </div>
                        <div class="macro">
                            <b>{{ round(item.fats) }}</b>
                            <span>жиры, г</span>
                        </div>
                        <div class="macro">
                            <b>{{ round(item.carbohydrates) }}</b>
                            <span>углеводы, г</span>
                        </div>
                    </div>
                    <p class="muted"><i class="fa-solid fa-weight-scale"></i> Вес блюда: {{ item.weight || '≈300' }} г</p>

                    <div v-if="item.recipe_name" class="tt-tile block">
                        <span class="block-label">Рецепт</span>
                        <p class="block-title">{{ item.recipe_name }}</p>
                        <p v-if="item.ingredients" class="text"><b>Ингредиенты:</b> {{ item.ingredients }}</p>
                        <p v-if="item.instructions" class="text"><b>Как готовить:</b> {{ item.instructions }}</p>
                    </div>
                </template>

                <!-- Действия страницы: например, «Отменить тренировку» у тренера -->
                <div v-if="$slots.actions" class="details-actions">
                    <slot name="actions" />
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import { formatTime } from '@/components/utils/week.js';

// Подробности тренировки или блюда из расписания; закрывается по фону и крестику
export default {
    name: 'ScheduleDetails',
    props: {
        item: { type: Object, default: null },
        // session | meal
        type: { type: String, default: 'session' }
    },
    methods: {
        time: formatTime,
        round(value) {
            return Math.round(Number(value) || 0);
        }
    }
};
</script>

<style scoped>
.details {
    width: min(600px, 100%);
}

.tt-eyebrow--blue {
    border-color: rgba(55, 96, 231, 0.3);
    background: rgba(55, 96, 231, 0.06);
    color: var(--tt-blue-deep);
}

.chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: -8px 0 16px;
}

.text {
    margin: 0 0 10px;
    color: var(--tt-soft);
    font-size: 15px;
    line-height: 1.6;
}

.muted {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 6px;
    color: var(--tt-muted);
    font-size: 14px;
}

.block {
    margin-top: 18px;
    padding: 18px;
}

.block-label {
    color: var(--tt-brand-deep);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.block-title {
    margin: 4px 0 8px;
    color: var(--tt-ink);
    font-size: 17px;
    font-weight: 700;
}

.macros {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    margin: -6px 0 14px;
}

.macro {
    display: grid;
    gap: 2px;
    padding: 12px;
    border-radius: var(--tt-radius-md);
    background-color: var(--tt-blue-tint);
    text-align: center;
    font-variant-numeric: tabular-nums;
}

.macro b {
    color: var(--tt-blue-deep);
    font-size: 20px;
    font-weight: 700;
}

.macro span {
    color: var(--tt-muted);
    font-size: 12px;
}

.macro--kcal {
    background-color: var(--tt-brand-tint);
}

.macro--kcal b {
    color: var(--tt-brand-deep);
}

.details-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid var(--tt-line);
}

@media (max-width: 560px) {
    .tt-modal {
        padding: 28px 20px;
    }

    .macros {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
