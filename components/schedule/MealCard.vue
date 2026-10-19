<template>
    <article :class="['tt-card', 'tt-card--lift', 'meal', { 'meal--compact': compact }]" tabindex="0" role="button"
        :aria-label="`${meal.meal_type}: ${meal.food_name}, ${meal.calories} ккал`" @click="$emit('open')"
        @keydown.enter.prevent="$emit('open')">
        <span class="tt-icon-tile tt-icon-tile--sm tt-icon-tile--blue meal-icon" aria-hidden="true"><i :class="icon"></i></span>

        <div class="meal-body">
            <span class="meal-type">{{ meal.meal_type }}</span>
            <h4 class="meal-name">{{ meal.food_name }}</h4>
            <p v-if="!compact && hasMacros" class="meal-macros">
                Б {{ round(meal.proteins) }} · Ж {{ round(meal.fats) }} · У {{ round(meal.carbohydrates) }} г
            </p>
        </div>

        <div class="meal-kcal">
            <b>{{ meal.calories }}</b>
            <span>ккал</span>
        </div>
    </article>
</template>

<script>
const MEAL_ICONS = {
    'Завтрак': 'fa-solid fa-mug-hot',
    'Обед': 'fa-solid fa-bowl-food',
    'Ужин': 'fa-solid fa-fish'
};

export default {
    name: 'MealCard',
    props: {
        meal: { type: Object, required: true },
        compact: { type: Boolean, default: false }
    },
    computed: {
        icon() {
            return MEAL_ICONS[this.meal.meal_type] || 'fa-solid fa-utensils';
        },
        hasMacros() {
            return this.meal.proteins != null && this.meal.fats != null && this.meal.carbohydrates != null;
        }
    },
    methods: {
        round(value) {
            return Math.round(Number(value) || 0);
        }
    }
};
</script>

<style scoped>
/* Основа — .tt-card; питание перекрашено в синий, дополнительный цвет палитры */
.meal {
    --tt-focus-ring: rgba(55, 96, 231, 0.45);
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 14px;
    padding: 14px 16px 14px 18px;
    overflow: hidden;
    border-color: rgba(55, 96, 231, 0.22);
    cursor: pointer;
}

/* Питание помечено синим — дополнительным цветом палитры */
.meal::before {
    content: "";
    position: absolute;
    top: 14px;
    bottom: 14px;
    left: 0;
    width: 4px;
    border-radius: 0 4px 4px 0;
    background: linear-gradient(180deg, #5a7cf0, #3760e7);
}

.meal:hover {
    border-color: rgba(55, 96, 231, 0.45);
    box-shadow: 0 18px 40px -18px rgba(55, 96, 231, 0.45);
}

.meal-body {
    display: grid;
    gap: 2px;
    min-width: 0;
}

.meal-type {
    color: var(--tt-blue-deep);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.meal-name {
    margin: 0;
    color: var(--tt-ink);
    font-size: 15px;
    font-weight: 600;
    line-height: 1.35;
}

.meal-macros {
    margin: 2px 0 0;
    color: var(--tt-muted);
    font-size: 13px;
}

.meal-kcal {
    display: grid;
    justify-items: end;
    font-variant-numeric: tabular-nums;
}

.meal-kcal b {
    color: var(--tt-ink);
    font-size: 18px;
    font-weight: 700;
    line-height: 1.1;
}

.meal-kcal span {
    color: var(--tt-muted);
    font-size: 12px;
}

/* ---------- компактный вид (неделя) ---------- */

.meal--compact {
    grid-template-columns: minmax(0, 1fr);
    gap: 2px;
    padding: 10px 10px 10px 14px;
    border-radius: var(--tt-radius-md);
}

.meal--compact::before {
    top: 10px;
    bottom: 10px;
    width: 3px;
}

.meal--compact .meal-icon {
    display: none;
}

.meal--compact .meal-type {
    font-size: 11px;
}

.meal--compact .meal-name {
    overflow: hidden;
    font-size: 13px;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.meal--compact .meal-kcal {
    justify-items: start;
}

.meal--compact .meal-kcal b {
    font-size: 12px;
    font-weight: 600;
    color: var(--tt-muted);
}

.meal--compact .meal-kcal b::after {
    content: " ккал";
}

.meal--compact .meal-kcal span {
    display: none;
}

.meal--compact:hover {
    transform: translateY(-2px);
}

@media (prefers-reduced-motion: reduce) {
    .meal:hover {
        transform: none;
    }
}
</style>
