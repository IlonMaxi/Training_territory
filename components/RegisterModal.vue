<template>
    <div v-if="isVisible" class="modal-overlay">
        <div class="modal">
            <button class="close" @click="closeModal">✖</button>
            <h2>Регистрация</h2>
            <form @submit.prevent="register">
                <label>
                    <span class="label-text">ФАМИЛИЯ ИМЯ ОТЧЕСТВО</span>
                    <div class="name-fields">
                        <input type="text" v-model="lastName" placeholder="Фамилия" required>
                        <input type="text" v-model="firstName" placeholder="Имя" required>
                        <input type="text" v-model="middleName" placeholder="Отчество" required>
                    </div>
                </label>
                <label>
                    <span class="label-text">ЛОГИН И ПАРОЛЬ</span>
                    <div class="login-password-fields">
                        <input type="text" v-model="username" placeholder="Введите ваш логин" required>
                        <input type="password" v-model="password" placeholder="Введите ваш пароль" required
                            :class="{ 'invalid': !isPasswordValid }" @input="validatePassword">
                        <transition name="fade">
                            <div v-if="!isPasswordValid" class="tooltip">Пароль должен содержать минимум 8 символов,
                                включая заглавную букву, цифру и спецсимвол.</div>
                        </transition>
                    </div>
                </label>
                <label>
                    <span class="label-text">НОМЕР ТЕЛЕФОНА И ЭЛЕКТРОННАЯ ПОЧТА</span>
                    <div class="phone-email-fields">
                        <input type="tel" v-model="phone" placeholder="+7 (XXX) XXX-XX-XX" required maxlength="11"
                            :class="{ 'invalid': !isPhoneValid }" @input="validatePhone" @keypress="onlyNumbers">
                        <transition name="fade">
                            <div v-if="!isPhoneValid" class="tooltip">Телефон должен содержать 11 цифр и начинаться с 8.
                            </div>
                        </transition>
                        <input type="email" v-model="email" placeholder="example@mail.com" required
                            :class="{ 'invalid': !isEmailValid }" @input="validateEmail">
                        <transition name="fade">
                            <div v-if="!isEmailValid" class="tooltip">Введите корректный адрес электронной почты.</div>
                        </transition>
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
                <label>
                    <span class="label-text">ДАТА РОЖДЕНИЯ</span>
                    <div class="birth-date">
                        <select v-model="birthDay" required>
                            <option disabled value="">День</option>
                            <option v-for="n in availableDays" :key="n" :value="n">{{ n }}</option>
                        </select>
                        <select v-model="birthMonth" required @change="updateAvailableDays">
                            <option disabled value="">Месяц</option>
                            <option v-for="(month, index) in months" :key="index" :value="index + 1">{{ month }}
                            </option>
                        </select>
                        <select v-model="birthYear" required @change="updateAvailableDays">
                            <option disabled value="">Год</option>
                            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                        </select>
                    </div>
                </label>
                <label>
                    <span class="label-text">ПОЛ</span>
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
                <div class="buttons">
                    <button type="button" class="login-button" @click="goToLogin">ЕСТЬ АККАУНТ</button>
                    <button type="submit" class="register-button" :disabled="!isFormValid">ДАЛЕЕ</button>
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
            firstName: '',
            lastName: '',
            middleName: '',
            username: '',
            password: '',
            phone: '',
            email: '',
            accountType: '',
            birthDay: '',
            birthMonth: '',
            birthYear: '',
            gender: '',
            isPasswordValid: true,
            isPhoneValid: true,
            isEmailValid: true,
            availableDays: [],
            months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            years: Array.from({ length: 100 }, (v, i) => new Date().getFullYear() - i)
        };
    },
    computed: {
        isFormValid() {
            return this.isPasswordValid && this.isPhoneValid && this.isEmailValid && this.phone !== '' && this.password !== '';
        }
    },
    methods: {
        closeModal() {
            this.$emit('close');
        },
        async register() {
            this.validateEmail(); // Проверка электронной почты перед регистрацией
            if (!this.isFormValid) {
                alert("Пожалуйста, заполните все поля правильно.");
                return;
            }

            const payload = {
                Фамилия: this.lastName,
                Имя: this.firstName,
                Отчество: this.middleName,
                Логин: this.username,
                Пароль: this.password,  // Пароль будет захеширован на сервере
                Номер_телефона: this.phone,
                Адрес_электронной_почты: this.email,
                Дата_рождения: `${this.birthYear}-${this.birthMonth}-${this.birthDay}`,
                Пол: this.gender,
            };

            // Определяем путь в зависимости от типа аккаунта
            const path = this.accountType === 'trainer' ? '/api/coaches' : '/api/clients';

            try {
                const response = await fetch(`http://192.168.0.108:3000${path}`, { // Измените на корректный URL при необходимости
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorData = await response.text(); // Получаем текст ошибки
                    throw new Error(`Ошибка при регистрации: ${errorData}`);
                }

                const data = await response.json();
                console.log('Регистрация успешна', data);
                this.closeModal(); // Закрываем модальное окно после успешной регистрации
            } catch (error) {
                console.error('Ошибка:', error);
                alert(`Ошибка при регистрации. Пожалуйста, попробуйте снова.\n${error.message}`);
            }
        },


        goToLogin() {
            this.$emit('go-to-login');
        },
        validatePassword() {
            const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
            this.isPasswordValid = regex.test(this.password);
        },
        validatePhone() {
            if (!this.phone.startsWith('8')) {
                this.phone = '8' + this.phone;
            }
            const phoneRegex = /^8\d{10}$/;
            this.isPhoneValid = phoneRegex.test(this.phone);
        },
        validateEmail() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            this.isEmailValid = emailRegex.test(this.email);
        },
        onlyNumbers(e) {
            const char = String.fromCharCode(e.keyCode);
            if (!/[0-9]/.test(char)) {
                e.preventDefault();
            }
        },
        updateAvailableDays() {
            const daysInMonth = new Date(this.birthYear, this.birthMonth, 0).getDate();
            this.availableDays = Array.from({ length: daysInMonth }, (v, i) => i + 1);

            if (this.birthDay > daysInMonth) {
                this.birthDay = '';
            }
        }
    },
    mounted() {
        this.updateAvailableDays();
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

.invalid {
    border-color: red;
}

.tooltip {
    background-color: red;
    color: white;
    padding: 5px;
    border-radius: 5px;
    font-size: 12px;
    position: relative;
    text-align: center;
    display: flex;
    align-items: center;
    font-weight: bold;
}

.modal {
    background: #333;
    color: white;
    padding: 40px;
    border-radius: 10px;
    width: 70vw;
    position: relative;
    text-align: center;
    padding-top: 0;
    padding-bottom: 0;
    overflow: visible;
}

.modal select {
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: #444;
    color: white;
    width: 100%;
    margin-top: 5px;
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

.label-text {
    display: block;
    margin-bottom: 5px;
}

.name-fields,
.login-password-fields,
.phone-email-fields {
    display: flex;
    gap: 10px;
    margin-top: 5px;
}

.birth-date input,
.name-fields input[type="text"],
.login-password-fields input[type="text"],
.login-password-fields input[type="password"],
.phone-email-fields input[type="tel"],
.phone-email-fields input[type="email"] {
    flex: 1;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: #444;
    color: white;
}

.birth-date,
.gender,
.account-type {
    margin-top: 5px;
    display: flex;
    gap: 10px;
}

.birth-date input {
    flex: 1;
}

.birth-date {
    display: flex;
    gap: 10px;
    overflow: visible;
}

.birth-date select {
    flex: 1;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: #444;
    color: white;
    width: 100%;
    margin-top: 5px;
    z-index: 1000;
    position: relative;
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
    margin-bottom: 0;
    border: 1px solid #ccc;
}

.gender input[type="radio"],
.account-type input[type="radio"] {
    margin-right: 5px;
}

.buttons {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    gap: 10px;
}

.login-button {
    padding: 10px;
    background: white;
    border: 1px solid #FF5733;
    color: #FF5733;
    border-radius: 5px;
    cursor: pointer;
    width: 50%;
}

.register-button {
    padding: 10px;
    background: #FF5733;
    border: none;
    color: white;
    border-radius: 5px;
    cursor: pointer;
    width: 50%;
}

@media (max-width: 815px) {

    .login-password-fields,
    .phone-email-fields {
        flex-direction: column;
    }

    .name-fields,
    .birth-date {
        display: flex;
        gap: 10px;
    }

    .name-fields input,
    .birth-date input {
        flex: 1;
        min-width: 50px;
    }

    .login-button,
    .register-button {
        width: 100%;
    }

    .tooltip {
        font-size: 10px;
        padding: 4px;
    }
}
</style>