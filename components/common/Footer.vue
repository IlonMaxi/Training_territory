<template>
    <SiteFooter :columns="columns" @select="onSelect" />
</template>

<script>
import SiteFooter from '@/components/common/SiteFooter.vue';

// Подвал главной (до входа): переключение «Тренеру / Клиенту» и вход
export default {
    name: 'FooterComponent',
    components: { SiteFooter },
    props: ['isTrainFlipActive'],
    computed: {
        columns() {
            return [
                {
                    title: 'Главная',
                    links: [
                        { key: 'trainer', label: 'Тренеру', icon: 'fa-solid fa-dumbbell', active: this.isTrainFlipActive },
                        { key: 'client', label: 'Клиенту', icon: 'fa-solid fa-user-check', active: !this.isTrainFlipActive }
                    ]
                },
                {
                    title: 'Аккаунт',
                    links: [
                        { key: 'login', label: 'Вход', icon: 'fa-solid fa-user' },
                        { key: 'register', label: 'Регистрация', icon: 'fa-solid fa-user-plus' }
                    ]
                }
            ];
        }
    },
    methods: {
        onSelect(key) {
            const events = {
                trainer: 'activate-train-flip',
                client: 'activate-client-flip',
                login: 'open-login-modal',
                register: 'open-register-modal'
            };
            this.$emit(events[key]);
        }
    }
}
</script>
