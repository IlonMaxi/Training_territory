<template>
    <div v-if="isVisible" class="modal-overlay">
        <div class="modal">
            <button class="close" @click="closeModal">✖</button>
            <h2>Войти</h2>
            <div class="login-section">
                <div class="branding">
                    <p>AGAIN</p>
                    <p>AGAIN</p>
                    <p>AGAIN</p>
                    <p>AGAIN</p>
                    <p>AGAIN</p>
                </div>
                <form @submit.prevent="login">
                    <label>
                        ЛОГИН
                        <input type="text" v-model="username" required>
                    </label>
                    <label>
                        ПАРОЛЬ
                        <input type="password" v-model="password" required>
                    </label>
                    <button type="submit" class="login-button">ВОЙТИ</button>

                    <div class="register-link">
                        <p id="notReg">Нет аккаунта?</p>
                        <button type="button" @click="goToRegister">Регистрация</button>
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
            password: ''
        };
    },
    methods: {
        closeModal() {
            this.$emit('close');
        },
        login() {
            // Логика для входа пользователя
            console.log('Логин:', this.username, 'Пароль:', this.password);
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
    padding-left: 45%;
    padding-right: 45%;
}

.modal {
    background: #333;
    color: white;
    padding: 20px;
    border-radius: 10px;
    width: 400px;
    position: relative;
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
}

.branding {
    margin-right: 20px;
}

.branding p {
    margin: 0;
    font-size: 24px;
    color: #666;
}

form {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

form label {
    display: block;
    margin-bottom: 15px;
}

form input {
    width: 280px;
    padding: 10px;
    margin-top: 5px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: #444;
    color: white;
}

.login-button {
    width: 150px;
    padding: 10px;
    background: #FF5733;
    border: none;
    color: white;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
}

.register-link {
    text-align: center;
}

.register-link button {
    width: 150px;
    background: white;
    color: #FF5733;
    border: 1px solid #FF5733;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
}

#notReg {
    font-size: 12px;
}
</style>