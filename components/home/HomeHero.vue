<template>
    <section class="tt-container hero">
        <div class="hero-text">
            <Reveal :y="10" :duration="550">
                <span class="tt-eyebrow" data-connector-anchor>
                    <i class="fa-solid fa-fire"></i>
                    {{ eyebrow }}
                </span>
            </Reveal>

            <Reveal as="h1" variant="wipe" class="hero-title" :y="8" :duration="650" :delay="60">
                <slot name="title" />
            </Reveal>

            <Reveal as="p" class="hero-lead" :y="10" :duration="650" :delay="100">{{ lead }}</Reveal>

            <Reveal as="ul" variant="wipe" class="hero-bullets" :y="10" :duration="700" :delay="140">
                <li v-for="bullet in bullets" :key="bullet.accent">
                    <span class="tt-icon-tile tt-icon-tile--sm"><i :class="bullet.icon"></i></span>
                    <span>{{ bullet.lead }}<span class="bullet-accent">{{ bullet.accent }}</span></span>
                </li>
            </Reveal>

            <Reveal class="hero-actions" :y="22" :scale="0.98" :duration="650" :delay="200">
                <button type="button" class="tt-btn tt-btn--primary" @click="$emit('register')">
                    {{ ctaLabel }} <span class="tt-arrow" aria-hidden="true">→</span>
                </button>
                <a :href="`#${anchor}`" class="tt-btn tt-btn--ghost" @click.prevent="scrollToAnchor">
                    {{ anchorLabel }} <i class="fa-solid fa-arrow-down anchor-arrow"></i>
                </a>
            </Reveal>
        </div>

        <Reveal class="hero-visual" variant="bubbleSoft" :duration="900" :delay="120">
            <HeroFitGirl v-if="figure === 'fitgirl'" />
            <HeroAthlete v-else />
        </Reveal>
    </section>
</template>

<script>
import Reveal from '@/components/ui/Reveal.vue';
import HeroAthlete from '@/components/home/HeroAthlete.vue';
import HeroFitGirl from '@/components/home/HeroFitGirl.vue';

export default {
    name: 'HomeHero',
    components: { Reveal, HeroAthlete, HeroFitGirl },
    props: {
        eyebrow: { type: String, required: true },
        lead: { type: String, required: true },
        // [{ icon, lead, accent }] — маркеры с иконками под заголовком
        bullets: { type: Array, required: true },
        ctaLabel: { type: String, required: true },
        anchor: { type: String, required: true },
        anchorLabel: { type: String, required: true },
        // Кто нарисован справа: bodybuilder — атлет со штангой (HeroAthlete), fitgirl — девушка со скакалкой
        figure: { type: String, default: 'bodybuilder' }
    },
    methods: {
        // scrollIntoView учитывает scroll-margin-top под фиксированной шапкой;
        // переход по хэшу сделал бы это через scrollBehavior роутера — без отступа
        scrollToAnchor() {
            const target = document.getElementById(this.anchor);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
};
</script>

<style scoped>
.hero {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    align-items: center;
    gap: 32px;
}

.hero-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    max-width: 540px;
}

.hero-title {
    margin: 0;
    color: var(--tt-ink);
    font-size: 56px;
    font-weight: 600;
    line-height: 1.05;
    letter-spacing: -0.03em;
}

.hero-lead {
    margin: 0;
    color: var(--tt-soft);
    font-size: 18px;
    line-height: 1.6;
}

.hero-bullets {
    display: grid;
    gap: 14px;
    margin: 0;
    padding: 0;
    list-style: none;
}

.hero-bullets li {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--tt-ink);
    font-size: 17px;
    line-height: 1.5;
}

.bullet-accent {
    color: var(--tt-brand-deep);
    font-weight: 600;
}

.hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding-top: 4px;
}

.anchor-arrow {
    font-size: 13px;
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.tt-btn:hover .anchor-arrow {
    transform: translateY(3px);
}

.hero-visual {
    position: relative;
    min-width: 0;
}

@media (max-width: 1024px) {
    .hero {
        grid-template-columns: minmax(0, 1fr);
        gap: 16px;
    }

    .hero-text {
        max-width: 680px;
    }
}

@media (max-width: 640px) {
    .hero-text {
        gap: 20px;
    }

    .hero-title {
        font-size: 36px;
        line-height: 1.08;
    }

    .hero-lead {
        font-size: 16px;
    }

    .hero-bullets li {
        font-size: 15px;
    }

    .hero-actions {
        width: 100%;
    }

    .hero-actions .tt-btn {
        width: 100%;
    }
}
</style>
