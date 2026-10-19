<template>
    <SiteHeader collapse="lg" menu-label="Меню кабинета">
        <template #brand>
            <nuxt-link :to="homePath" class="brand-link" aria-label="Training Territory — в кабинет">
                <BrandLogo />
            </nuxt-link>
        </template>

        <template #nav>
            <nav class="cabinet-nav" aria-label="Разделы кабинета">
                <button v-for="item in navItems" :key="item.key" type="button" class="tt-nav-flip" @click="go(item)">
                    <i :class="item.icon"></i>
                    <span class="tt-nav-flip-inner">
                        <span class="tt-nav-flip-front">{{ item.label }}</span>
                        <span class="tt-nav-flip-top" aria-hidden="true">{{ item.label }}</span>
                    </span>
                </button>
            </nav>
        </template>

        <template #actions>
            <button type="button" :class="['assistant', { 'is-active': aiChat.isOpen }]"
                :aria-pressed="aiChat.isOpen ? 'true' : 'false'" @click="aiChat.toggle()">
                <i class="fa-solid fa-compass"></i> Помощник
            </button>
            <button type="button" class="tt-icon-btn" :aria-label="isDark ? 'Светлая тема' : 'Тёмная тема'"
                :title="isDark ? 'Светлая тема' : 'Тёмная тема'" @click="toggleTheme">
                <i :class="themeIcon"></i>
            </button>
            <nuxt-link to="/Profile" class="avatar" title="Профиль" aria-label="Профиль">{{ initials }}</nuxt-link>
            <button type="button" class="tt-icon-btn" title="Выйти" aria-label="Выйти" @click="logout">
                <i class="fa-solid fa-right-from-bracket"></i>
            </button>
        </template>

        <template #compact>
            <button type="button" :class="['tt-icon-btn', { 'is-active': aiChat.isOpen }]" aria-label="Помощник"
                @click="aiChat.toggle()">
                <i class="fa-solid fa-compass"></i>
            </button>
        </template>

        <template #menu="{ close }">
            <p class="tt-menu-label">Разделы</p>
            <button v-for="item in navItems" :key="item.key" type="button" class="tt-menu-item"
                @click="go(item); close()">
                <i :class="item.icon"></i> {{ item.label }}
            </button>
            <nuxt-link to="/Profile" class="tt-menu-item" @click.native="close()">
                <i class="fa-solid fa-user"></i> Профиль
            </nuxt-link>
            <button type="button" class="tt-menu-item" @click="aiChat.open(); close()">
                <i class="fa-solid fa-compass"></i> Помощник
            </button>
            <button type="button" class="tt-menu-item" @click="toggleTheme">
                <i :class="themeIcon"></i> {{ isDark ? 'Светлая тема' : 'Тёмная тема' }}
            </button>
            <button type="button" class="tt-btn tt-btn--ghost" @click="logout">
                <i class="fa-solid fa-right-from-bracket"></i> Выйти
            </button>
        </template>
    </SiteHeader>
</template>

<script>
import SiteHeader from '@/components/common/SiteHeader.vue';
import BrandLogo from '@/components/common/BrandLogo.vue';
import aiChat from '@/components/utils/AiChatState.js';
import { readCookie, readUser, homeRoute, safePush, goToSection, logout } from '@/components/utils/cabinet.js';
import { initialsOf } from '@/components/utils/format.js';

export default {
    name: 'CabinetHeader',
    components: { SiteHeader, BrandLogo },
    data() {
        return {
            aiChat,
            isAdmin: false,
            isDark: false,
            accountType: null,
            user: null
        };
    },
    mounted() {
        if (readCookie('theme') === 'dark') {
            document.body.classList.add('dark-theme');
            this.isDark = true;
        }
        this.accountType = readCookie('accountType');
        this.user = readUser();
        this.isAdmin = !!this.user && this.user.clientid === 1;
    },
    computed: {
        themeIcon() {
            return this.isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        },
        homePath() {
            const name = homeRoute(this.accountType);
            return name ? { name } : '/';
        },
        initials() {
            if (!this.user) return '';
            return initialsOf(this.user.first_name, this.user.last_name) || 'TT';
        },
        // Разделы зависят от роли: у тренера — назначение тренировок и клиенты
        navItems() {
            const items = this.accountType === 'trainer'
                ? [
                    { key: 'schedule', label: 'Расписание', icon: 'fa-solid fa-calendar-days', section: 'schedule' },
                    { key: 'assign', label: 'Назначить', icon: 'fa-solid fa-calendar-plus', section: 'assign' },
                    { key: 'clients', label: 'Клиенты', icon: 'fa-solid fa-users', route: { path: '/Profile', query: { menu: 'clients' } } }
                ]
                : [
                    { key: 'schedule', label: 'Расписание', icon: 'fa-solid fa-calendar-days', section: 'schedule' },
                    { key: 'nutrition', label: 'Питание', icon: 'fa-solid fa-utensils', section: 'nutrition' },
                    { key: 'progress', label: 'Прогресс', icon: 'fa-solid fa-chart-line', section: 'progress' }
                ];

            if (this.isAdmin) {
                items.push({ key: 'admin', label: 'Админ-панель', icon: 'fa-solid fa-shield-halved', route: '/AdminPage' });
            }
            return items;
        }
    },
    methods: {
        go(item) {
            if (item.route) safePush(this.$router, item.route);
            else goToSection(this, item.section);
        },
        logout() {
            logout(this.$router);
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
        }
    }
};
</script>

<style scoped>
.brand-link {
    display: inline-flex;
    text-decoration: none;
}

.cabinet-nav {
    display: flex;
    align-items: center;
    gap: 2px;
}

/* Кнопка помощника: в открытом состоянии залита оранжевым */
.assistant {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 42px;
    margin: 0;
    padding: 0 16px;
    border: 1px solid var(--tt-line-brand);
    border-radius: var(--tt-radius-pill);
    background-color: var(--tt-surface);
    color: var(--tt-ink);
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.assistant i {
    color: var(--tt-brand);
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), color 0.3s ease;
}

.assistant:hover {
    border-color: var(--tt-brand);
    background-color: var(--tt-brand-50);
}

.assistant:hover i {
    transform: rotate(180deg);
}

.assistant.is-active {
    border-color: transparent;
    background: var(--tt-gradient-brand);
    color: #ffffff;
}

.assistant.is-active i {
    color: #ffffff;
}

/* Аватар с инициалами — ссылка в профиль */
.avatar {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: var(--tt-gradient-brand);
    box-shadow: 0 0 0 3px var(--tt-surface), 0 8px 18px -8px rgba(248, 80, 10, 0.8);
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-decoration: none;
    transition: transform 0.35s cubic-bezier(0.2, 1.3, 0.3, 1);
}

.avatar:hover {
    transform: scale(1.06);
}

@media (prefers-reduced-motion: reduce) {

    .assistant i,
    .avatar {
        transition: none;
    }

    .assistant:hover i,
    .avatar:hover {
        transform: none;
    }
}
</style>
