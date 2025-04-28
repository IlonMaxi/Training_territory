<template>
    <div>
        <HeaderLast @open-login-modal="showLoginModal = true" @open-register-modal="showRegisterModal = true"
            @activate-train-flip="activateTrainFlip" @activate-client-flip="activateClientFlip"
            :isTrainFlipActive="isTrainFlipActive" />
        <LoginModal :isVisible="showLoginModal" @close="showLoginModal = false"
            @go-to-register="showRegisterModal = true; showLoginModal = false" />
        <RegisterModal :isVisible="showRegisterModal" @close="showRegisterModal = false"
            @go-to-login="showLoginModal = true; showRegisterModal = false" />

        <TrainFlip v-if="isTrainFlipActive" />
        <ClientFlip v-if="!isTrainFlipActive" />

        <FooterComponent @open-login-modal="showLoginModal = true" @open-register-modal="showRegisterModal = true"
            @activate-train-flip="activateTrainFlip" @activate-client-flip="activateClientFlip"
            :isTrainFlipActive="isTrainFlipActive" />
    </div>
</template>

<script>
import HeaderLast from '~/components/HeaderLast.vue';
import LoginModal from '~/components/LoginModal.vue';
import RegisterModal from '~/components/RegisterModal.vue';
import FooterComponent from '~/components/Footer.vue';
import TrainFlip from '~/components/TrainFlip.vue';
import ClientFlip from '~/components/ClientFlip.vue';

export default {
    components: {
        HeaderLast,
        LoginModal,
        RegisterModal,
        FooterComponent,
        TrainFlip,
        ClientFlip,
    },
    data() {
        return {
            showLoginModal: false,
            showRegisterModal: false,
            isTrainFlipActive: true,
        };
    },
    methods: {
        activateTrainFlip() {
            this.isTrainFlipActive = true;
        },
        activateClientFlip() {
            this.isTrainFlipActive = false;
        }
    }
};
</script>

<style>
body {
    margin: 0px;
    background-color: var(--background-color);
    color: var(--text-color);
    transition: background-color 0.5s ease, color 0.5s ease;
}

button {
    padding: 10px 20px;
    background-color: var(--button-border-color);
    color: var(--text-color);
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin: 5px 0;
    transition: background-color 0.5s ease, color 0.5s ease;
}

button:hover {
    background-color: var(--button-hover-color);
}
</style>
