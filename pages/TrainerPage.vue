<template>
  <div class="tt-page">
    <div class="tt-backdrop" aria-hidden="true"></div>
    <HeaderAfterLogin />

    <main class="tt-main">
      <CabinetHero role="trainer" :user="user" :sessions="sessions" :loading="loading" />
      <ScheduleComponent :sessions="sessions" :loading="loading" :error="error" @cancelled="removeSession"
        @plan="planOn" />
      <AssignComponent :coach-id="coachId" :sessions="sessions" :plan="plan" @assigned="loadSchedule(true)" />
    </main>

    <FooterLast />
  </div>
</template>

<script>
import HeaderAfterLogin from '~/components/common/Header.vue';
import CabinetHero from '~/components/cabinet/CabinetHero.vue';
import ScheduleComponent from '~/components/trainer/Schedule_trainer.vue';
import AssignComponent from '~/components/trainer/Assign_trainer.vue';
import FooterLast from '~/components/common/FooterLast.vue';
import { readCookie, readUser, scrollToQuerySection } from '~/components/utils/cabinet.js';
import { toISODate } from '~/components/utils/week.js';

export default {
  components: {
    HeaderAfterLogin,
    CabinetHero,
    ScheduleComponent,
    AssignComponent,
    FooterLast
  },
  data() {
    return {
      user: null,
      accountType: null,
      sessions: [],
      loading: true,
      error: null,
      // День, выбранный в расписании для нового занятия
      plan: null
    };
  },
  computed: {
    coachId() {
      return this.user && this.user.coachid;
    }
  },
  // См. ClientPage: cookie читаем только после монтирования, иначе ломается гидрация
  mounted() {
    this.user = readUser();
    this.accountType = readCookie('accountType');

    if (!this.user || !this.accountType) {
      this.$router.push('/');
      return;
    }

    this.loadSchedule();
    scrollToQuerySection(this);
  },
  methods: {
    // silent — обновление после назначения: без скелетонов поверх готового расписания
    async loadSchedule(silent = false) {
      if (!this.coachId) {
        this.loading = false;
        this.error = 'Не удалось определить тренера — войдите заново.';
        return;
      }
      if (!silent) this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`/api/schedule/${this.coachId}`);
        if (response.status === 401) this.error = 'Сессия истекла — войдите заново.';
        const data = await response.json();
        // Пустое расписание сервер отдаёт как 404 с {error} — это не ошибка, а свободная неделя
        this.sessions = Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('Ошибка загрузки расписания:', err);
        this.error = 'Не удалось загрузить расписание. Проверьте соединение.';
        if (!silent) this.sessions = [];
      } finally {
        this.loading = false;
      }
    },
    removeSession(scheduleId) {
      this.sessions = this.sessions.filter(session => session.scheduleid !== scheduleId);
    },
    planOn(date) {
      this.plan = { date: toISODate(date), at: Date.now() };
      this.$nextTick(() => {
        const form = document.getElementById('assign');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }
};
</script>
