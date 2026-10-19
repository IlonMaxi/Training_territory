<template>
    <div :class="['site-header-root', `site-header-root--${collapse}`]">
        <!-- Шапка фиксированная: распорка держит под ней место в потоке -->
        <div class="header-spacer" aria-hidden="true"></div>

        <header :class="['site-header', { 'is-menu-open': isMenuOpen }]">
            <div class="tt-container header-inner">
                <slot name="brand" />

                <div class="header-nav">
                    <slot name="nav" />
                </div>

                <div class="header-actions">
                    <slot name="actions" />
                </div>

                <!-- То, что остаётся рядом с бургером на узком экране -->
                <div class="header-compact">
                    <slot name="compact" />
                    <button type="button" :class="['burger', { 'is-open': isMenuOpen }]"
                        :aria-label="isMenuOpen ? 'Закрыть меню' : 'Открыть меню'"
                        :aria-expanded="isMenuOpen ? 'true' : 'false'" @click="isMenuOpen = !isMenuOpen">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
        </header>

        <transition name="menu-fade">
            <div v-if="isMenuOpen" class="menu-scrim" @click="close"></div>
        </transition>

        <transition name="menu-pop">
            <nav v-if="isMenuOpen" class="mobile-menu" :aria-label="menuLabel">
                <slot name="menu" :close="close" />
            </nav>
        </transition>
    </div>
</template>

<script>
/*
  Общий каркас шапки: «стеклянная» панель, бургер и мобильное меню.
  Содержимое — в слотах: публичная шапка (HeaderLast) и шапка кабинета
  (Header) отличаются только им.
*/
export default {
    name: 'SiteHeader',
    props: {
        // С какой ширины прятать меню в бургер: md — 900px, lg — 1100px
        collapse: {
            type: String,
            default: 'md',
            validator: (value) => ['md', 'lg'].includes(value)
        },
        menuLabel: { type: String, default: 'Меню' }
    },
    data() {
        return { isMenuOpen: false };
    },
    watch: {
        // Переход на другую страницу закрывает меню
        '$route.fullPath'() {
            this.close();
        }
    },
    methods: {
        close() {
            this.isMenuOpen = false;
        }
    }
};
</script>

<style scoped>
.site-header-root {
    --header-height: 80px;
}

.header-spacer {
    height: var(--header-height);
}

.site-header {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 1500;
    background-color: rgba(255, 255, 255, 0.72);
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.1);
    -webkit-backdrop-filter: blur(18px) saturate(1.4);
    backdrop-filter: blur(18px) saturate(1.4);
    /* right меняет layouts/default.vue, когда открыт помощник */
    transition:
        background-color 0.5s ease,
        box-shadow 0.3s ease,
        right 0.35s cubic-bezier(0.2, 0.7, 0.3, 1);
}

body.dark-theme .site-header {
    background-color: rgba(14, 16, 20, 0.72);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
}

.site-header.is-menu-open {
    background-color: var(--tt-surface);
    box-shadow: none;
}

.header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    height: var(--header-height);
}

.header-nav,
.header-actions,
.header-compact {
    display: flex;
    align-items: center;
    gap: 8px;
}

.header-compact {
    display: none;
}

/* ---------- бургер ---------- */

.burger {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    width: 46px;
    height: 46px;
    margin: 0;
    padding: 0 12px;
    border: 1px solid var(--tt-line-brand);
    border-radius: 50%;
    background-color: var(--tt-surface);
    cursor: pointer;
}

.burger span {
    display: block;
    height: 2px;
    border-radius: 2px;
    background-color: var(--tt-ink);
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease;
}

.burger.is-open span:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
}

.burger.is-open span:nth-child(2) {
    opacity: 0;
}

.burger.is-open span:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
}

/* ---------- мобильное меню ---------- */

.menu-scrim {
    position: fixed;
    inset: var(--header-height) 0 0;
    z-index: 1400;
    background-color: rgba(15, 20, 39, 0.35);
}

.mobile-menu {
    position: fixed;
    top: calc(var(--header-height) + 8px);
    right: 16px;
    left: 16px;
    z-index: 1500;
    display: grid;
    gap: 10px;
    max-height: calc(100vh - var(--header-height) - 24px);
    padding: 18px;
    overflow-y: auto;
    border: 1px solid var(--tt-line-brand);
    border-radius: var(--tt-radius-lg);
    background-color: var(--tt-surface);
    box-shadow: 0 30px 60px -20px rgba(15, 20, 39, 0.35);
    transform-origin: top center;
}

.mobile-menu ::v-deep .tt-btn {
    width: 100%;
}

.menu-fade-enter-active,
.menu-fade-leave-active {
    transition: opacity 0.3s ease;
}

.menu-fade-enter,
.menu-fade-leave-to {
    opacity: 0;
}

.menu-pop-enter-active {
    transition: opacity 0.35s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.menu-pop-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.menu-pop-enter,
.menu-pop-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
}

/* ---------- когда прятать меню в бургер ---------- */

@media (max-width: 900px) {

    .site-header-root--md .header-nav,
    .site-header-root--md .header-actions {
        display: none;
    }

    .site-header-root--md .header-compact {
        display: flex;
    }
}

@media (min-width: 901px) {

    .site-header-root--md .menu-scrim,
    .site-header-root--md .mobile-menu {
        display: none;
    }
}

@media (max-width: 1100px) {

    .site-header-root--lg .header-nav,
    .site-header-root--lg .header-actions {
        display: none;
    }

    .site-header-root--lg .header-compact {
        display: flex;
    }
}

@media (min-width: 1101px) {

    .site-header-root--lg .menu-scrim,
    .site-header-root--lg .mobile-menu {
        display: none;
    }
}

@media (max-width: 640px) {
    .site-header-root {
        --header-height: 68px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .burger span {
        transition: none;
    }
}
</style>
