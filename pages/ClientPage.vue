<template>
  <div>
    <HeaderAfterLogin />
    <ScheduleComponent :user="user" />
    <section id="progress">
      <AddMeasurements v-if="accountType === 'client'" :client="user" />
    </section>
    <FooterLastComponent />
  </div>
</template>

<script>
import HeaderAfterLogin from '~/components/common/Header.vue';
import ScheduleComponent from '~/components/client/Schedule.vue';
import FooterLastComponent from '~/components/common/FooterLast.vue';
import AddMeasurements from '~/components/client/AddMeasurements.vue';

export default {
    components: {
        HeaderAfterLogin,
        ScheduleComponent,
        FooterLastComponent,
        AddMeasurements
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
                this.$router.push('/');
            }
        },

        // Удаление куки и выход
        async logout() {
            if (process.client) {
                try {
                    await fetch('/api/logout', { method: 'POST' });
                } catch (err) {
                    console.error('Ошибка при выходе:', err);
                }
                document.cookie = 'user=; path=/; max-age=0;';
                document.cookie = 'accountType=; path=/; max-age=0;';
                this.$router.push('/');
            }
        }
    },
    // Данные берём из cookie только на клиенте: created() выполняется и на
    // сервере, где cookie нет, и разные деревья ломали гидрацию Vue
    mounted() {
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
