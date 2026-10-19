<template>
    <transition name="tt-modal" :duration="{ enter: 450, leave: 200 }">
        <div v-if="isVisible" class="tt-modal-overlay">
            <div class="tt-modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
                <button type="button" class="tt-modal-close" aria-label="Закрыть" @click="closeModal">
                    <i class="fa-solid fa-xmark"></i>
                </button>

                <span class="tt-eyebrow"><i class="fa-solid fa-dumbbell"></i> Training Territory</span>
                <h2 id="login-title" class="tt-modal-title">Вход в <span class="tt-accent">личный кабинет</span></h2>

                <div v-if="errorMessage" class="tt-form-error" role="alert">
                    <i class="fa-solid fa-circle-exclamation"></i> {{ errorMessage }}
                </div>

                <form @submit.prevent="login">
                    <div class="tt-field">
                        <span class="tt-field-label">Логин / email и пароль</span>
                        <div class="login-password-fields">
                            <input class="tt-input" type="text" v-model="username" placeholder="Логин или email"
                                autocomplete="username" required>
                            <input class="tt-input" type="password" v-model="password" placeholder="Пароль"
                                autocomplete="current-password" required>
                        </div>
                    </div>

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

                    <div class="button-group">
                        <button type="submit" class="tt-btn tt-btn--primary">
                            Войти <span class="tt-arrow" aria-hidden="true">→</span>
                        </button>
                        <button type="button" class="tt-btn tt-btn--ghost" @click="goToRegister">Нет аккаунта</button>
                    </div>
                </form>
            </div>
        </div>
    </transition>
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
            accountType: '',
            errorMessage: ''
        };
    },
    methods: {
        closeModal() {
            this.$emit('close');
            this.errorMessage = '';
        },
        async login() {
            this.errorMessage = '';
            if (this.username && this.password && this.accountType) {
                const url = this.accountType === 'trainer'
                    ? '/api/login/coaches'
                    : '/api/login/clients';

                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: this.username,
                            password: this.password
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        console.log('Вход успешен:', data);
                        this.closeModal();

                        // Сохраняем данные в куки
                        document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=86400;`;
                        document.cookie = `accountType=${this.accountType}; path=/; max-age=86400;`;

                        if (this.accountType === 'trainer') {
                            this.$router.push({
                                name: 'TrainerPage'
                            });
                        } else {
                            this.$router.push({
                                name: 'ClientPage'
                            });
                        }
                    } else {
                        this.errorMessage = data.error || 'Произошла ошибка при входе';
                    }
                } catch (error) {
                    this.errorMessage = 'Ошибка сети. Пожалуйста, попробуйте позже.';
                    console.error('Ошибка сети:', error);
                }
            } else {
                this.errorMessage = 'Не все данные заполнены';
            }
        },

        goToRegister() {
            this.$emit('go-to-register');
        }
    }
};
</script>

<style scoped>
.login-password-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.button-group {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 8px;
}

@media (max-width: 560px) {
    .tt-modal {
        padding: 28px 20px;
    }

    .login-password-fields,
    .button-group {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
