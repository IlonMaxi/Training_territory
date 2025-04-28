<template>
    <div>
        <HeaderAfterLogin />
        <ScheduleComponent :user="user" />
        <FooterLastComponent />
    </div>
</template>

<script>
import HeaderAfterLogin from '~/components/Header.vue';
import ScheduleComponent from '~/components/Schedule.vue';
import FooterLastComponent from '~/components/FooterLast.vue';

export default {
    components: {
        HeaderAfterLogin,
        ScheduleComponent,
        FooterLastComponent
    },
    data() {
        return {
            user: null, // Храним данные пользователя
            accountType: null // Тип аккаунта
        };
    },
    methods: {
        // Функция для получения куки
        getCookie(name) {
            if (process.client) { // Убедимся, что код выполняется на клиенте
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) {
                    return decodeURIComponent(parts.pop().split(';').shift());
                }
            }
            return null;
        },

        // Восстановление данных пользователя из куки
        restoreUserData() {
            const userCookie = this.getCookie('user');
            const accountTypeCookie = this.getCookie('accountType');

            if (userCookie && accountTypeCookie) {
                this.user = JSON.parse(userCookie); // Преобразуем строку JSON в объект
                this.accountType = accountTypeCookie;
            } else {
                // Если данных нет, перенаправляем на страницу входа
                this.$router.push({ name: 'LoginPage' });
            }
        },

        // Удаление куки и выход
        logout() {
            if (process.client) { // Убедимся, что код выполняется на клиенте
                document.cookie = 'user=; path=/; max-age=0;';
                document.cookie = 'accountType=; path=/; max-age=0;';
                this.$router.push({ name: 'LoginPage' });
            }
        }
    },
    created() {
        this.restoreUserData(); // Восстанавливаем данные при загрузке страницы
    }
};
</script>

<style scoped>
body {
    background-color: var(--background-color);
    color: var(--text-color);
    transition: background-color 0.5s ease, color 0.5s ease;
}
</style>