<template>
    <div v-if="isVisible" class="modal-overlay">
        <div class="modal">
            <button class="close" @click="closeModal">✖</button>
            <h2>Регистрация</h2>
            <form @submit.prevent="register">
                <label>
                    ИМЯ ФАМИЛИЯ
                    <input type="text" v-model="fullName" required>
                </label>
                <label>
                    ЛОГИН
                    <input type="text" v-model="username" required>
                </label>
                <label>
                    ПАРОЛЬ
                    <input type="password" v-model="password" required>
                </label>
                <label>
                    ТИП АККАУНТА
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
                <label>
                    ДАТА РОЖДЕНИЯ
                    <div class="birth-date">
                        <input type="text" v-model="birthDay" placeholder="День" required>
                        <input type="text" v-model="birthMonth" placeholder="Месяц" required>
                        <input type="text" v-model="birthYear" placeholder="Год" required>
                    </div>
                </label>
                <label>
                    ПОЛ
                    <div class="gender">
                        <label>
                            <input type="radio" v-model="gender" value="male" required>
                            Мужской
                        </label>
                        <label>
                            <input type="radio" v-model="gender" value="female" required>
                            Женский
                        </label>
                    </div>
                </label>
                <p class="existing-account">Уже есть аккаунт?</p>
                <div class="buttons">
                    <button type="button" class="login-button" @click="goToLogin">ВОЙТИ</button>
                    <button type="submit" class="register-button">ДАЛЕЕ</button>
                </div>
                
            </form>
        </div>
    </div>
</template>

<script>
export default {
    name: 'RegisterModal',
    props: {
        isVisible: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            fullName: '',
            username: '',
            password: '',
            accountType: '',
            birthDay: '',
            birthMonth: '',
            birthYear: '',
            gender: ''
        };
    },
    methods: {
        closeModal() {
            this.$emit('close');
        },
        register() {
            // Логика для регистрации пользователя
            console.log('Регистрация:', this.fullName, this.username, this.password, this.accountType, `${this.birthDay}/${this.birthMonth}/${this.birthYear}`, this.gender);
            this.closeModal();
        },
        goToLogin() {
            // Логика для перехода к окну входа
            this.$emit('go-to-login');
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

.modal {
    background: #333;
    color: white;
    padding: 40px;
    border-radius: 10px;
    width: 400px;
    position: relative;
    text-align: center;
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

h2 {
    margin-bottom: 20px;
    font-size: 24px;
}

form {
    display: flex;
    flex-direction: column;
}

form label {
    align-items: flex-start;
    margin-bottom: 15px;
    font-size: 14px;
    font-weight: bold;
    text-align: left;
    width: 100%;
}

form input[type="text"],
form input[type="password"] {
    width: calc(100% - 20px);
    padding: 10px;
    margin-top: 5px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: #444;
    color: white;
}

.birth-date,
.gender,
.account-type {
    display: flex;
    gap: 10px;
}

.birth-date input {
    flex: 1;
}

.gender label,
.account-type label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #444;
    border-radius: 5px;
    padding: 10px;
    cursor: pointer;
}

.gender input[type="radio"],
.account-type input[type="radio"] {
    margin-right: 5px;
}

.buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

.login-button {
    padding: 10px;
    background: white;
    border: 1px solid #FF5733;
    color: #FF5733;
    border-radius: 5px;
    cursor: pointer;
    width: 48%;
}

.register-button {
    padding: 10px;
    background: #FF5733;
    border: none;
    color: white;
    border-radius: 5px;
    cursor: pointer;
    width: 48%;
}

.existing-account {
    margin: 0px;
    padding-right: 50%;
    font-size: 12px;
    color: #ccc;
}
</style>