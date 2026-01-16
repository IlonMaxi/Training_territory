<template>
  <div>
    <HeaderAfterLogin />
    
    <section id="schedule">
      <ScheduleComponent :user="user" />
    </section>

    <section id="assign">
      <AssignComponent />
    </section>

    <FooterLast />
  </div>
</template>

<script>
import HeaderAfterLogin from '~/components/common/Header.vue';
import ScheduleComponent from '~/components/trainer/Schedule_trainer.vue';
import AssignComponent from '~/components/trainer/Assign_trainer.vue';
import FooterLast from '~/components/common/FooterLast.vue';

export default {
  components: {
    HeaderAfterLogin,
    ScheduleComponent,
    AssignComponent,
    FooterLast
  },
  data() {
    return {
      user: null,
      accountType: null
    };
  },
  methods: {
    getCookie(name) {
      if (process.client) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
      }
      return null;
    },
    restoreUserData() {
      const userCookie = this.getCookie('user');
      const accountTypeCookie = this.getCookie('accountType');

      if (userCookie && accountTypeCookie) {
        this.user = JSON.parse(userCookie);
        this.accountType = accountTypeCookie;
        this.$root.user = this.user;
      } else {
        this.$router.push({ name: 'LoginPage' });
      }
    },
    scrollToSection(section) {
      this.$nextTick(() => {
        const el = document.getElementById(section);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  },
  created() {
    this.restoreUserData();
  },
  mounted() {
    const section = this.$route.query.section;
    if (section) {
      this.scrollToSection(section);
    }
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

