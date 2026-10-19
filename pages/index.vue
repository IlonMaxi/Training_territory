<template>
    <div class="tt-page">
        <div class="tt-backdrop" aria-hidden="true"></div>

        <HeaderLast @open-login-modal="showLoginModal = true" @open-register-modal="showRegisterModal = true"
            @activate-train-flip="activateTrainFlip" @activate-client-flip="activateClientFlip"
            :isTrainFlipActive="isTrainFlipActive" />
        <LoginModal :isVisible="showLoginModal" @close="showLoginModal = false"
            @go-to-register="showRegisterModal = true; showLoginModal = false" />
        <RegisterModal :isVisible="showRegisterModal" @close="showRegisterModal = false"
            @go-to-login="showLoginModal = true; showRegisterModal = false" />

        <transition name="role-swap" mode="out-in">
            <TrainFlip v-if="isTrainFlipActive" key="trainer" @open-login-modal="showLoginModal = true"
                @open-register-modal="showRegisterModal = true" />
            <ClientFlip v-else key="client" @open-login-modal="showLoginModal = true"
                @open-register-modal="showRegisterModal = true" />
        </transition>

        <FooterComponent @open-login-modal="showLoginModal = true" @open-register-modal="showRegisterModal = true"
            @activate-train-flip="activateTrainFlip" @activate-client-flip="activateClientFlip"
            :isTrainFlipActive="isTrainFlipActive" />
    </div>
</template>

<script>
import HeaderLast from '~/components/common/HeaderLast.vue';
import LoginModal from '~/components/modals/LoginModal.vue';
import RegisterModal from '~/components/modals/RegisterModal.vue';
import FooterComponent from '~/components/common/Footer.vue';
import TrainFlip from '~/components/flip/TrainFlip.vue';
import ClientFlip from '~/components/flip/ClientFlip.vue';

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
            this.switchRole(true);
        },
        activateClientFlip() {
            this.switchRole(false);
        },
        // Содержимое вкладок разное по высоте: показываем новую с первого экрана
        switchRole(isTrainer) {
            if (this.isTrainFlipActive === isTrainer) return;
            this.isTrainFlipActive = isTrainer;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
};
</script>

<style scoped>
.role-swap-enter-active {
    transition: opacity 0.35s ease;
}

.role-swap-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.role-swap-enter,
.role-swap-leave-to {
    opacity: 0;
}

.role-swap-leave-to {
    transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {

    .role-swap-enter-active,
    .role-swap-leave-active {
        transition: none;
    }
}
</style>
