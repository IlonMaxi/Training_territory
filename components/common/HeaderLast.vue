<template>
    <SiteHeader collapse="md">
        <template #brand>
            <a href="/" class="brand-link" aria-label="Training Territory — наверх" @click.prevent="scrollToTop">
                <BrandLogo />
            </a>
        </template>

        <template #nav>
            <div class="role-switch" role="group" aria-label="Для кого показывать главную">
                <span :class="['role-thumb', { 'role-thumb--right': !isTrainFlipActive }]" aria-hidden="true"></span>
                <button type="button" :class="['role-option', { active: isTrainFlipActive }]"
                    :aria-pressed="isTrainFlipActive ? 'true' : 'false'" @click="activateTrainFlip">
                    <i class="fa-solid fa-dumbbell"></i> Тренеру
                </button>
                <button type="button" :class="['role-option', { active: !isTrainFlipActive }]"
                    :aria-pressed="!isTrainFlipActive ? 'true' : 'false'" @click="activateClientFlip">
                    <i class="fa-solid fa-user-check"></i> Клиенту
                </button>
            </div>
        </template>

        <template #actions>
            <button type="button" class="tt-icon-btn" :aria-label="isDark ? 'Светлая тема' : 'Тёмная тема'"
                :title="isDark ? 'Светлая тема' : 'Тёмная тема'" @click="toggleTheme">
                <i :class="themeIcon"></i>
            </button>
            <button type="button" class="tt-nav-flip" @click="openLoginModal">
                <span class="tt-nav-flip-inner">
                    <span class="tt-nav-flip-front">Вход</span>
                    <span class="tt-nav-flip-top" aria-hidden="true">Вход</span>
                </span>
            </button>
            <button type="button" class="tt-btn tt-btn--primary tt-btn--sm" @click="openRegisterModal">
                Регистрация
            </button>
        </template>

        <template #menu="{ close }">
            <p class="tt-menu-label">Главная для</p>
            <div class="menu-roles">
                <button type="button" :class="['menu-role', { active: isTrainFlipActive }]"
                    @click="activateTrainFlip(); close()">
                    <i class="fa-solid fa-dumbbell"></i> Тренеру
                </button>
                <button type="button" :class="['menu-role', { active: !isTrainFlipActive }]"
                    @click="activateClientFlip(); close()">
                    <i class="fa-solid fa-user-check"></i> Клиенту
                </button>
            </div>
            <button type="button" class="tt-btn tt-btn--primary" @click="openRegisterModal(); close()">
                Регистрация <span class="tt-arrow" aria-hidden="true">→</span>
            </button>
            <button type="button" class="tt-btn tt-btn--ghost" @click="openLoginModal(); close()">
                Вход
            </button>
            <button type="button" class="menu-theme" @click="toggleTheme">
                <i :class="themeIcon"></i> {{ isDark ? 'Светлая тема' : 'Тёмная тема' }}
            </button>
        </template>
    </SiteHeader>
</template>

<script>
import SiteHeader from '@/components/common/SiteHeader.vue';
import BrandLogo from '@/components/common/BrandLogo.vue';

export default {
    name: 'HeaderLast',
    components: { SiteHeader, BrandLogo },
    props: ['isTrainFlipActive'],
    data() {
        return {
            isDark: false
        }
    },
    mounted() {
        const savedTheme = this.getCookie('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            this.isDark = true;
        } else {
            document.body.classList.remove('dark-theme');
            this.isDark = false;
        }
    },
    computed: {
        themeIcon() {
            return this.isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
    },
    methods: {
        openLoginModal() {
            this.$emit('open-login-modal');
        },
        openRegisterModal() {
            this.$emit('open-register-modal');
        },
        activateTrainFlip() {
            this.$emit('activate-train-flip');
        },
        activateClientFlip() {
            this.$emit('activate-client-flip');
        },
        scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        toggleTheme() {
            this.isDark = !this.isDark;
            if (this.isDark) {
                document.body.classList.add('dark-theme');
                this.setCookie('theme', 'dark', 365);
            } else {
                document.body.classList.remove('dark-theme');
                this.setCookie('theme', 'light', 365);
            }
        },
        setCookie(name, value, days) {
            const d = new Date();
            d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = "expires=" + d.toUTCString();
            document.cookie = `${name}=${value};${expires};path=/`;
        },
        getCookie(name) {
            const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
                const [key, value] = cookie.split('=');
                acc[key] = decodeURIComponent(value);
                return acc;
            }, {});
            return cookies[name] || null;
        }
    }
}
</script>

<style scoped>
.brand-link {
    display: inline-flex;
    text-decoration: none;
}

/* ---------- переключатель «Тренеру / Клиенту» ---------- */

.role-switch {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 4px;
    border: 1px solid var(--tt-line-brand);
    border-radius: var(--tt-radius-pill);
    background-color: var(--tt-surface);
}

/* Ползунок уезжает под выбранный вариант */
.role-thumb {
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: 4px;
    width: calc(50% - 4px);
    border-radius: var(--tt-radius-pill);
    background: var(--tt-gradient-brand);
    box-shadow: 0 10px 22px -10px rgba(248, 80, 10, 0.85);
    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.role-thumb--right {
    transform: translateX(100%);
}

.role-option {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 40px;
    margin: 0;
    padding: 0 20px;
    border: 0;
    border-radius: var(--tt-radius-pill);
    background: transparent;
    color: var(--tt-soft);
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: color 0.3s ease;
}

.role-option:hover {
    color: var(--tt-brand-deep);
}

.role-option.active {
    color: #ffffff;
}

/* ---------- мобильное меню ---------- */

.menu-roles {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 4px;
}

.menu-role {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 48px;
    margin: 0;
    border: 1px solid var(--tt-line-brand);
    border-radius: var(--tt-radius-md);
    background-color: var(--tt-surface);
    color: var(--tt-ink);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
}

.menu-role.active {
    border-color: transparent;
    background: var(--tt-gradient-brand);
    color: #ffffff;
}

.menu-theme {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    height: 46px;
    margin: 0;
    border: 0;
    border-radius: var(--tt-radius-md);
    background: transparent;
    color: var(--tt-soft);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
    .role-thumb {
        transition: none;
    }
}
</style>
