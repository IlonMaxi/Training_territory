<template>
    <!-- Шапка секции как на лендинге: бейдж, заголовок с акцентом, подводка.
         Бейдж — якорь для линий BadgeConnectors. -->
    <div class="section-head">
        <Reveal :y="10">
            <span class="tt-eyebrow" data-connector-anchor>
                <i v-if="icon" :class="icon"></i>
                {{ eyebrow }}
            </span>
        </Reveal>
        <Reveal as="h2" :id="titleId" class="tt-h2" variant="wipeX" :y="0">
            <slot />
        </Reveal>
        <Reveal v-if="lead" as="p" class="tt-lead" :y="8" :delay="60">{{ lead }}</Reveal>
    </div>
</template>

<script>
import Reveal from '@/components/ui/Reveal.vue';

export default {
    name: 'SectionHead',
    components: { Reveal },
    props: {
        eyebrow: { type: String, required: true },
        icon: { type: String, default: '' },
        lead: { type: String, default: '' },
        titleId: { type: String, default: null }
    }
};
</script>

<style scoped>
.section-head {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 40px;
}

@media (max-width: 640px) {
    .section-head {
        margin-bottom: 28px;
    }
}
</style>
