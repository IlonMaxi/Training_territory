<template>
    <transition name="tt-modal" :duration="{ enter: 450, leave: 200 }">
        <div v-if="isVisible" class="tt-modal-overlay">
            <div class="tt-modal register-modal" role="dialog" aria-modal="true" aria-labelledby="register-title">
                <button type="button" class="tt-modal-close" aria-label="Закрыть" @click="closeModal">
                    <i class="fa-solid fa-xmark"></i>
                </button>

                <span class="tt-eyebrow"><i class="fa-solid fa-dumbbell"></i> Training Territory</span>
                <h2 id="register-title" class="tt-modal-title">Создайте <span class="tt-accent">аккаунт</span></h2>

                <form @submit.prevent="register">
                    <div class="tt-field">
                        <span class="tt-field-label">Фамилия, имя, отчество</span>
                        <div class="fields fields--3">
                            <input class="tt-input" type="text" v-model="last_name" placeholder="Фамилия"
                                autocomplete="family-name" required>
                            <input class="tt-input" type="text" v-model="first_name" placeholder="Имя"
                                autocomplete="given-name" required>
                            <input class="tt-input" type="text" v-model="patronymic" placeholder="Отчество"
                                autocomplete="additional-name" required>
                        </div>
                    </div>

                    <div class="tt-field">
                        <span class="tt-field-label">Логин и пароль</span>
                        <div class="fields fields--2">
                            <input class="tt-input" type="text" v-model="username" placeholder="Введите ваш логин"
                                autocomplete="username" required>
                            <div class="field-with-hint">
                                <input class="tt-input" type="password" v-model="password"
                                    placeholder="Введите ваш пароль" autocomplete="new-password" required
                                    :class="{ 'invalid': !isPasswordValid }" @input="validatePassword">
                                <transition name="hint">
                                    <div v-if="!isPasswordValid" class="tooltip">Пароль должен содержать минимум 8
                                        символов, включая заглавную букву, цифру и спецсимвол.</div>
                                </transition>
                            </div>
                        </div>
                    </div>

                    <div class="tt-field">
                        <span class="tt-field-label">Номер телефона и электронная почта</span>
                        <div class="fields fields--2">
                            <div class="field-with-hint">
                                <input class="tt-input" type="tel" v-model="phone_number"
                                    placeholder="+7 (XXX) XXX-XX-XX" required maxlength="11" autocomplete="tel"
                                    :class="{ 'invalid': !isPhoneValid }" @input="validatePhone"
                                    @keypress="onlyNumbers">
                                <transition name="hint">
                                    <div v-if="!isPhoneValid" class="tooltip">Телефон должен содержать 11 цифр и
                                        начинаться с 8.</div>
                                </transition>
                            </div>
                            <div class="field-with-hint">
                                <input class="tt-input" type="email" v-model="email" placeholder="example@mail.com"
                                    required autocomplete="email" :class="{ 'invalid': !isEmailValid }"
                                    @input="validateEmail">
                                <transition name="hint">
                                    <div v-if="!isEmailValid" class="tooltip">Введите корректный адрес электронной
                                        почты.</div>
                                </transition>
                            </div>
                        </div>
                    </div>

                    <div class="fields fields--2 pair">
                        <div class="tt-field">
                            <span class="tt-field-label">Тип аккаунта</span>
                            <div class="tt-choice-group">
                                <label :class="['tt-choice', { checked: accountType === 'trainer' }]">
                                    <input type="radio" v-model="accountType" value="trainer" required>
                                    <i class="fa-solid fa-dumbbell"></i> Тренер
                                </label>
                                <label :class="['tt-choice', { checked: accountType === 'client' }]">
                                    <input type="radio" v-model="accountType" value="client" required>
                                    <i class="fa-solid fa-user-check"></i> Клиент
                                </label>
                            </div>
                        </div>

                        <div class="tt-field">
                            <span class="tt-field-label">Пол</span>
                            <div class="tt-choice-group">
                                <label :class="['tt-choice', { checked: gender === 'male' }]">
                                    <input type="radio" v-model="gender" value="male" required>
                                    Мужской
                                </label>
                                <label :class="['tt-choice', { checked: gender === 'female' }]">
                                    <input type="radio" v-model="gender" value="female" required>
                                    Женский
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="tt-field">
                        <span class="tt-field-label">Дата рождения</span>
                        <div class="fields fields--3">
                            <select class="tt-input" v-model="birthDay" required aria-label="День рождения">
                                <option disabled value="">День</option>
                                <option v-for="n in availableDays" :key="n" :value="n">{{ n }}</option>
                            </select>
                            <select class="tt-input" v-model="birthMonth" required aria-label="Месяц рождения"
                                @change="updateAvailableDays">
                                <option disabled value="">Месяц</option>
                                <option v-for="(month, index) in months" :key="index" :value="index + 1">{{ month }}
                                </option>
                            </select>
                            <select class="tt-input" v-model="birthYear" required aria-label="Год рождения"
                                @change="updateAvailableDays">
                                <option disabled value="">Год</option>
                                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                            </select>
                        </div>
                    </div>

                    <div v-if="errorMessage" class="tt-form-error" role="alert">
                        <i class="fa-solid fa-circle-exclamation"></i> {{ errorMessage }}
                    </div>

                    <div class="buttons">
                        <button type="button" class="tt-btn tt-btn--ghost" @click="goToLogin">Есть аккаунт</button>
                        <button type="submit" class="tt-btn tt-btn--primary" :disabled="!isFormValid">
                            Далее <span class="tt-arrow" aria-hidden="true">→</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </transition>
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
            first_name: '',
            last_name: '',
            patronymic: '',
            username: '',
            password: '',
            phone_number: '',
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
            errorMessage: '',
            months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            years: Array.from({ length: 100 }, (v, i) => new Date().getFullYear() - i)
        };
    },
    computed: {
        isFormValid() {
            return this.isPasswordValid && this.isPhoneValid && this.isEmailValid && this.phone_number !== '' && this.password !== '';
        }
    },
    methods: {
        closeModal() {
            this.$emit('close');
            this.errorMessage = '';
        },
        async register() {
            this.errorMessage = '';
            this.validateEmail();
            this.validatePassword();
            this.validatePhone();

            if (!this.isFormValid) {
                this.errorMessage = 'Пожалуйста, заполните все поля правильно.';
                return;
            }

            const payload = {
                last_name: this.last_name,
                first_name: this.first_name,
                patronymic: this.patronymic,
                username: this.username,
                password: this.password,
                phone_number: this.phone_number,
                email: this.email,
                birth_date: `${this.birthYear}-${String(this.birthMonth).padStart(2, '0')}-${String(this.birthDay).padStart(2, '0')}`,
                gender: this.gender,
            };

            const path = this.accountType === 'trainer' ? '/api/coaches' : '/api/clients';

            try {
                const response = await fetch(`${path}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (!response.ok) {
                    this.errorMessage = data.error || 'Ошибка при регистрации';
                    return;
                }

                // Сохранение в cookie
                document.cookie = `user=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=86400;`;
                document.cookie = `accountType=${this.accountType}; path=/; max-age=86400;`;

                // Перенаправление
                this.closeModal();
                if (this.accountType === 'client') {
                    this.$router.push('/ClientPage');
                } else if (this.accountType === 'trainer') {
                    this.$router.push('/TrainerPage');
                }
            } catch (error) {
                console.error('Ошибка регистрации:', error);
                this.errorMessage = 'Ошибка сети. Пожалуйста, попробуйте позже.';
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
            if (!this.phone_number.startsWith('8')) {
                this.phone_number = '8' + this.phone_number;
            }
            const phoneRegex = /^8\d{10}$/;
            this.isPhoneValid = phoneRegex.test(this.phone_number);
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
.register-modal {
    width: min(760px, 100%);
}

.fields {
    display: grid;
    gap: 10px;
}

.fields--2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.fields--3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}

/* Пара «тип аккаунта + пол» — две колонки, каждая со своей подписью */
.pair {
    gap: 16px;
}

.field-with-hint {
    display: grid;
    gap: 6px;
    min-width: 0;
}

.tooltip {
    color: #dc2626;
    font-size: var(--text-caption);
    font-weight: 600;
    line-height: 1.4;
}

body.dark-theme .tooltip {
    color: #fca5a5;
}

.hint-enter-active,
.hint-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}

.hint-enter,
.hint-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

.buttons {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 8px;
}

.buttons .tt-btn:disabled {
    cursor: not-allowed;
    opacity: 0.55;
    transform: none;
    box-shadow: none;
}

@media (max-width: 720px) {
    .tt-modal {
        padding: 28px 20px;
    }

    .fields--2,
    .fields--3,
    .buttons {
        grid-template-columns: minmax(0, 1fr);
    }

    .pair {
        gap: 0;
    }
}
</style>
