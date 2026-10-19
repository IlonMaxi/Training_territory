<template>
    <div :class="['features', `features--${columns}`]">
        <Reveal v-for="(item, index) in items" :key="item.title" variant="dropZ" :amount="0.2" :delay="100 + index * 90">
            <!-- Свечение под курсором и наклон живут на карточке, появление — на обёртке:
                 так два transform не мешают друг другу -->
            <article v-glow class="tt-card pointer-glow feature">
                <span v-if="beat" class="beat-marker" :style="{ '--i': index }" aria-hidden="true">
                    <i class="fa-solid fa-heart-pulse"></i>
                </span>
                <span class="tt-icon-tile"><i :class="item.icon"></i></span>
                <h3 class="feature-title">{{ item.title }}</h3>
                <p class="feature-text">{{ item.text }}</p>
            </article>
        </Reveal>
    </div>
</template>

<script>
import Reveal from '@/components/ui/Reveal.vue';

export default {
    name: 'FeatureCards',
    components: { Reveal },
    props: {
        // [{ icon, title, text }]
        items: { type: Array, required: true },
        columns: { type: Number, default: 2 },
        // Пульс, переходящий по карточкам, — рассчитан на три карточки
        beat: { type: Boolean, default: false }
    }
};
</script>

<style scoped>
.features {
    display: grid;
    gap: 20px;
}

.features--2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.features--3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}

.feature {
    height: 100%;
    padding: 28px;
}

.feature-title {
    margin: 20px 0 0;
    color: var(--tt-ink);
    font-size: 20px;
    font-weight: 700;
    line-height: 1.25;
}

.feature-text {
    margin: 10px 0 0;
    color: var(--tt-soft);
    font-size: 15px;
    line-height: 1.6;
}

@media (max-width: 960px) {
    .features--3 {
        grid-template-columns: minmax(0, 1fr);
    }
}

@media (max-width: 720px) {
    .features--2 {
        grid-template-columns: minmax(0, 1fr);
    }

    .feature {
        padding: 22px;
    }
}
</style>
