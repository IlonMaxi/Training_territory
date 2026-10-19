<template>
  <div class="tt-page">
    <div class="tt-backdrop" aria-hidden="true"></div>
    <HeaderAfterLogin />

    <main class="tt-main">
      <CabinetHero role="client" :user="user" :sessions="sessions" :meals="meals" :loading="loading" />
      <ScheduleComponent :sessions="sessions" :meals="meals" :loading="loading" :error="error" />
      <AddMeasurements v-if="accountType === 'client'" :client="user" />
    </main>

    <FooterLastComponent />
  </div>
</template>

<script>
import HeaderAfterLogin from '~/components/common/Header.vue';
import CabinetHero from '~/components/cabinet/CabinetHero.vue';
import ScheduleComponent from '~/components/client/Schedule.vue';
import FooterLastComponent from '~/components/common/FooterLast.vue';
import AddMeasurements from '~/components/client/AddMeasurements.vue';
import { readCookie, readUser, scrollToQuerySection } from '~/components/utils/cabinet.js';

export default {
    components: {
        HeaderAfterLogin,
        CabinetHero,
        ScheduleComponent,
        FooterLastComponent,
        AddMeasurements
    },
    data() {
        return {
            user: null, // Храним данные пользователя
            accountType: null, // Тип аккаунта
            sessions: [],
            meals: [],
            loading: true,
            error: null
        };
    },
    // Данные берём из cookie только на клиенте: created() выполняется и на
    // сервере, где cookie нет, и разные деревья ломали гидрацию Vue
    mounted() {
        this.user = readUser();
        this.accountType = readCookie('accountType');

        if (!this.user || !this.accountType) {
            // Если данных нет, перенаправляем на страницу входа
            this.$router.push('/');
            return;
        }

        this.loadSchedule();
        scrollToQuerySection(this);
    },
    methods: {
        // Расписание и рацион грузим здесь, а не в дочерних блоках: пользователь
        // известен только после mounted, и дети раньше успевали отказаться от загрузки
        async loadSchedule() {
            this.loading = true;
            this.error = null;
            try {
                const clientId = this.user.clientid;
                const [scheduleRes, nutritionRes] = await Promise.all([
                    fetch(`/api/schedule/client/${clientId}`),
                    fetch(`/api/nutrition/client/${clientId}`)
                ]);

                if (scheduleRes.status === 401 || nutritionRes.status === 401) {
                    this.error = 'Сессия истекла — войдите заново.';
                }

                const [schedule, nutrition] = await Promise.all([scheduleRes.json(), nutritionRes.json()]);
                // Пустое расписание сервер отдаёт как 404 с {error} — это не ошибка, а пустой день
                this.sessions = Array.isArray(schedule) ? schedule : [];
                this.meals = Array.isArray(nutrition) ? nutrition : [];
            } catch (err) {
                console.error('Ошибка загрузки расписания:', err);
                this.error = 'Не удалось загрузить расписание. Проверьте соединение.';
                this.sessions = [];
                this.meals = [];
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>
