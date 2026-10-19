<template>
    <span :class="['brand', { 'brand--light': light }]">
        <span class="brand-mark"><i class="fa-solid fa-dumbbell"></i></span>
        <span class="brand-text">
            <span>TRAINING</span>
            <span>TERRITORY</span>
        </span>
    </span>
</template>

<script>
export default {
    name: 'BrandLogo',
    props: {
        // Светлый вариант — для тёмных подложек (подвал)
        light: { type: Boolean, default: false }
    }
};
</script>

<style scoped>
.brand {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: 12px;
    color: var(--tt-ink);
}

.brand--light {
    color: #ffffff;
}

.brand-mark {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border-radius: var(--tt-radius-tile);
    background: var(--tt-gradient-brand);
    box-shadow: 0 10px 22px -10px rgba(248, 80, 10, 0.85);
    color: #ffffff;
    font-size: 18px;
    transform: rotate(-8deg);
    transition: transform 0.45s cubic-bezier(0.2, 1.3, 0.3, 1);
}

.brand:hover .brand-mark {
    transform: rotate(0deg) scale(1.06);
}

.brand-text {
    display: flex;
    flex-direction: column;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.05;
    letter-spacing: 0.04em;
}

@media (max-width: 640px) {
    .brand-mark {
        width: 38px;
        height: 38px;
        font-size: 16px;
    }

    .brand-text {
        font-size: 13px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .brand-mark {
        transition: none;
    }
}
</style>
