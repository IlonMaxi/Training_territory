<template>
    <div>
        <HeaderAfterLogin />
        <ScheduleComponent />
        <FooterComponent />
    </div>
</template>

<script>
import HeaderAfterLogin from '~/components/Header.vue';
import ScheduleComponent from '~/components/Schedule_trainer.vue';
import FooterComponent from '~/components/Footer.vue';

export default {
    components: {
        HeaderAfterLogin,
        ScheduleComponent,
        FooterComponent
    }
}
</script>

<style>
body {
    background-color: #272827;
}
</style>