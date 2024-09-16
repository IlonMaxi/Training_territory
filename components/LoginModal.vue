<template>
    <div v-if="isVisible" class="modal-overlay">
        <div class="modal">
            <button class="close" @click="closeModal">✖</button>
            <h2>Войти</h2>
            <div class="login-section">
                <div class="branding">
                    <div>
                        <p>A</p>
                        <p>GAIN</p>
                    </div>
                    <div>
                        <p id="p1">A</p>
                        <p>GAIN</p>
                    </div>
                    <div>
                        <p id="p2">A</p>
                        <p>GAIN</p>
                    </div>
                    <div>
                        <p id="p3">A</p>
                        <p>GAIN</p>
                    </div>
                    <div>
                        <p id="p4">A</p>
                        <p>GAIN</p>
                    </div>
                </div>
                <form @submit.prevent="login">
                    <label>
                        <span class="label-text">ЛОГИН / email И ПАРОЛЬ</span>
                        <div class="login-password-fields">
                            <input type="text" id="username" v-model="username" placeholder="Логин или email" required>
                            <input type="password" id="password" v-model="password" placeholder="Пароль" required>
                        </div>
                    </label>
                    <label>
                        <span class="label-text">ТИП АККАУНТА</span>
                        <div class="account-type">
                            <label>
                                <input type="radio" v-model="accountType" value="trainer" required>
                                Тренер
                            </label>
                            <label>
                                <input type="radio" v-model="accountType" value="client" required>
                                Клиент
                            </label>
                        </div>
                    </label>
                    <div class="button-group">
                        <button type="submit" class="login-button">ВОЙТИ</button>
                        <button type="button" class="register-link" @click="goToRegister">НЕТ АККАУНТА</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LoginModal',
    props: {
        isVisible: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            username: '',
            password: '',
            accountType: ''  // Добавлено для привязки к выбору типа аккаунта
        };
    },
    methods: {
        closeModal() {
            this.$emit('close');
        },
        login() {
            // Логика для входа пользователя
            console.log('Логин:', this.username, 'Пароль:', this.password, 'Тип аккаунта:', this.accountType);
            this.closeModal();
        },
        goToRegister() {
            // Логика для перехода к окну регистрации
            this.$emit('go-to-register');
        }
    }
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

h2 {
    text-align: center;
    margin-bottom: 20px;
}

.modal {
    background: #333;
    color: white;
    padding: 40px;
    border-radius: 10px;
    width: 70vw;
    position: relative;
    padding-top: 0;
    padding-bottom: 0;
}

.close {
    position: absolute;
    top: 10px;
    right: 10px;
    background: transparent;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
}

.login-section {
    display: flex;
    justify-content: center;
    align-items: center;
}

.branding {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-right: 20px;
    padding-bottom: 30px;
}

.branding p {
    margin: 0;
    font-size: 24px;
    color: #ffffff;
    display: inline-block;
    letter-spacing: 0;
    /* To ensure no gaps */
}

#p1 {
    opacity: 75%;
}

#p2 {
    opacity: 50%;
}

#p3 {
    opacity: 25%;
}

#p4 {
    opacity: 0%;
}

form {
    flex: 1;
    display: flex;
    flex-direction: column;
}

form label {
    align-items: flex-start;
    margin-bottom: 15px;
    font-size: 14px;
    font-weight: bold;
    text-align: left;
}

.label-text {
    display: block;
    margin-bottom: 5px;
}

.login-password-fields {
    display: flex;
    gap: 10px;
    margin-top: 5px;
}

.login-password-fields input {
    flex: 1;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: #444;
    color: white;
}

.button-group {
    display: flex;
    gap: 10px;
    width: 100%;
    justify-content: center;
    margin-bottom: 10px;
}

.login-button,
.register-link {
    padding: 10px;
    background: #FF5733;
    border: none;
    color: white;
    font-size: 14px;
    border-radius: 5px;
    cursor: pointer;
    width: 50%;
    text-align: center;
}

.register-link {
    background: white;
    color: #FF5733;
    border: 1px solid #FF5733;
}

.account-type label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #444;
    border-radius: 5px;
    padding: 10px;
    cursor: pointer;
    margin-bottom: 0;
    border: 1px solid #ccc;
}

.account-type {
    margin-top: 5px;
    display: flex;
    gap: 10px;
}

@media (max-width: 768px) {
    .branding {
        display: none;
    }

    .login-password-fields {
        flex-direction: column;
        align-items: stretch;
    }

    .login-password-fields input {
        max-width: none;
    }

    .login-button,
    .register-link {
        max-width: none;
        width: 100%;
    }
}
</style>ы