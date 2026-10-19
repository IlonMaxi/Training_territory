<template>
    <section class="tt-container stats" aria-label="Платформа в цифрах">
        <Reveal v-for="(stat, index) in stats" :key="stat.label" variant="bubbleSoft" :delay="80 + index * 90">
            <div class="tt-card tt-card--lift stat">
                <span class="tt-icon-tile"><i :class="stat.icon"></i></span>
                <div class="stat-value">
                    <CountUp :value="stat.value" :suffix="stat.suffix || ''" />
                </div>
                <p class="stat-label">{{ stat.label }}</p>
            </div>
        </Reveal>
    </section>
</template>

<script>
import Reveal from '@/components/ui/Reveal.vue';
import CountUp from '@/components/ui/CountUp.vue';

export default {
    name: 'HomeStats',
    components: { Reveal, CountUp },
    props: {
        // [{ icon, value, suffix?, label }]
        stats: { type: Array, required: true }
    }
};
</script>

<style scoped>
.stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
}

.stat {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    column-gap: 16px;
    height: 100%;
    padding: 24px 28px;
}

.stat-value {
    font-size: 44px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
    background: var(--tt-gradient-brand);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.stat-label {
    grid-column: 1 / -1;
    margin: 14px 0 0;
    color: var(--tt-muted);
    font-size: 15px;
    line-height: 1.5;
}

@media (max-width: 900px) {
    .stats {
        grid-template-columns: minmax(0, 1fr);
        gap: 12px;
    }

    .stat {
        padding: 20px;
    }

    .stat-value {
        font-size: 36px;
    }
}
</style>
