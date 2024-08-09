<template>
    <div>
        <HeaderLast @open-login-modal="showLoginModal = true" @open-register-modal="showRegisterModal = true" />
        <LoginModal :isVisible="showLoginModal" @close="showLoginModal = false"
            @go-to-register="showRegisterModal = true; showLoginModal = false" />
        <RegisterModal :isVisible="showRegisterModal" @close="showRegisterModal = false"
            @go-to-login="showLoginModal = true; showRegisterModal = false" />
    </div>
</template>

<script>
import HeaderLast from '~/components/HeaderLast.vue';
import LoginModal from '~/components/LoginModal.vue';
import RegisterModal from '~/components/RegisterModal.vue';

export default {
    components: {
        HeaderLast,
        LoginModal,
        RegisterModal
    },
    data() {
        return {
            showLoginModal: false,
            showRegisterModal: false
        };
    }
};
</script>
<style scoped>
button {
    padding: 10px 20px;
    background-color: #FF5733;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin: 20px 0;
}
</style>