<template>
    <SiteFooter :columns="columns" @select="onSelect" />
</template>

<script>
import SiteFooter from '@/components/common/SiteFooter.vue';
import { readCookie, safePush, goToSection, logout } from '@/components/utils/cabinet.js';

// Подвал кабинета: разделы своей страницы и профиль
export default {
    name: 'CabinetFooter',
    components: { SiteFooter },
    data() {
        return { accountType: null };
    },
    mounted() {
        this.accountType = readCookie('accountType');
    },
    computed: {
        columns() {
            const sections = this.accountType === 'trainer'
                ? [
                    { key: 'schedule', label: 'Расписание', icon: 'fa-solid fa-calendar-days' },
                    { key: 'assign', label: 'Назначить тренировку', icon: 'fa-solid fa-calendar-plus' },
                    { key: 'clients', label: 'Клиенты', icon: 'fa-solid fa-users' }
                ]
                : [
                    { key: 'schedule', label: 'Расписание', icon: 'fa-solid fa-calendar-days' },
                    { key: 'nutrition', label: 'Питание', icon: 'fa-solid fa-utensils' },
                    { key: 'progress', label: 'Прогресс', icon: 'fa-solid fa-chart-line' }
                ];

            return [
                { title: 'Кабинет', links: sections },
                {
                    title: 'Профиль',
                    links: [
                        { key: 'profile', label: 'Мой профиль', icon: 'fa-solid fa-user' },
                        { key: 'support', label: 'Поддержка', icon: 'fa-solid fa-headset' },
                        { key: 'logout', label: 'Выйти', icon: 'fa-solid fa-right-from-bracket' }
                    ]
                }
            ];
        }
    },
    methods: {
        onSelect(key) {
            if (key === 'logout') return logout(this.$router);
            if (key === 'profile') return safePush(this.$router, '/Profile');
            if (key === 'support') return safePush(this.$router, { path: '/Profile', query: { menu: 'support' } });
            if (key === 'clients') return safePush(this.$router, { path: '/Profile', query: { menu: 'clients' } });
            goToSection(this, key);
        }
    }
}
</script>
