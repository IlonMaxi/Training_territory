<template>
    <div :class="['bars', { 'bars--compact': compact }]">
        <div v-for="group in rows" :key="group.title" class="group">
            <h4 v-if="group.title" class="group-title">{{ group.title }}</h4>
            <div v-for="row in group.rows" :key="row.key" class="row"
                :aria-label="`${row.key}: ${row.label}`">
                <span class="row-name">{{ row.key }}</span>
                <span class="row-track" aria-hidden="true">
                    <span class="row-axis"></span>
                    <span v-if="row.value" :class="['row-fill', row.value > 0 ? 'row-fill--up' : 'row-fill--down']"
                        :style="{ '--w': row.share }"></span>
                </span>
                <span :class="['row-value', { up: row.value > 0, down: row.value < 0 }]">{{ row.label }}</span>
            </div>
        </div>
    </div>
</template>

<script>
// Изменения показателей в процентах с первого замера: столбик растёт от центра —
// вправо (оранжевый), если показатель вырос, влево (синий), если снизился
export default {
    name: 'ProgressBars',
    props: {
        // Ответ /progress-summary: { 'Вес': -4, 'Жировая масса': -9, ... }
        summary: { type: Object, default: null },
        // [{ title, keys: ['Вес', ...] }]
        groups: { type: Array, required: true },
        compact: { type: Boolean, default: false }
    },
    computed: {
        rows() {
            if (!this.summary) return [];
            const value = (key) => Math.round(Number(this.summary[key]) || 0);
            // Общий масштаб на все группы, чтобы столбики можно было сравнивать
            const all = this.groups.flatMap(group => group.keys.map(value));
            const max = Math.max(5, ...all.map(Math.abs));
            return this.groups
                .map(group => ({
                    title: group.title,
                    rows: group.keys
                        .filter(key => key in this.summary)
                        .map((key) => {
                            const number = value(key);
                            return {
                                key,
                                value: number,
                                share: Math.abs(number) / max,
                                label: `${number > 0 ? '+' : number < 0 ? '−' : ''}${Math.abs(number)}%`
                            };
                        })
                }))
                .filter(group => group.rows.length);
        }
    }
};
</script>

<style scoped>
.bars {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 22px 32px;
}

.group {
    display: grid;
    align-content: start;
    gap: 10px;
}

.group-title {
    margin: 0 0 2px;
    color: var(--tt-muted);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.row {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(90px, 1fr) 52px;
    align-items: center;
    gap: 12px;
}

.row-name {
    overflow: hidden;
    color: var(--tt-soft);
    font-size: 14px;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.row-track {
    position: relative;
    height: 10px;
    border-radius: var(--tt-radius-pill);
    background-color: var(--tt-bg-soft);
}

.row-axis {
    position: absolute;
    top: -3px;
    bottom: -3px;
    left: 50%;
    width: 2px;
    margin-left: -1px;
    border-radius: 2px;
    background-color: var(--tt-line-brand);
}

/* Столбик — половина дорожки, длину задаёт scaleX: так она плавно «вырастает» */
.row-fill {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 50%;
    transform: scaleX(var(--w, 0));
    animation: bar-grow 0.9s var(--tt-ease) both;
}

.row-fill--up {
    left: 50%;
    border-radius: 0 var(--tt-radius-pill) var(--tt-radius-pill) 0;
    background: linear-gradient(90deg, #ffb48a, #f8500a);
    transform-origin: 0 50%;
}

.row-fill--down {
    right: 50%;
    border-radius: var(--tt-radius-pill) 0 0 var(--tt-radius-pill);
    background: linear-gradient(270deg, #9fb4f7, #3760e7);
    transform-origin: 100% 50%;
}

@keyframes bar-grow {
    from {
        transform: scaleX(0);
    }
}

.row-value {
    color: var(--tt-muted);
    font-size: 14px;
    font-weight: 700;
    text-align: right;
    font-variant-numeric: tabular-nums;
}

.row-value.up {
    color: var(--tt-brand-deep);
}

.row-value.down {
    color: var(--tt-blue-deep);
}

.bars--compact {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
}

.bars--compact .row {
    grid-template-columns: minmax(0, 1fr) minmax(70px, 0.8fr) 46px;
    gap: 10px;
}

.bars--compact .row-name,
.bars--compact .row-value {
    font-size: 13px;
}

@media (max-width: 480px) {
    .bars {
        grid-template-columns: minmax(0, 1fr);
    }

    .row {
        grid-template-columns: minmax(0, 1fr) 80px 46px;
        gap: 10px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .row-fill {
        animation: none;
    }
}
</style>
