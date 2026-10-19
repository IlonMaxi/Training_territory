<template>
    <div class="tt-board feedback">
        <transition name="tt-swap" mode="out-in">
            <form v-if="!success" key="form" class="form" novalidate @submit.prevent="submitFeedback">
                <div class="rating">
                    <span class="tt-field-label">Ваша оценка</span>
                    <div class="stars" role="radiogroup" aria-label="Оценка от 1 до 5" @mouseleave="hover = 0">
                        <button v-for="n in 5" :key="n" type="button" role="radio"
                            :aria-checked="form.rating === n ? 'true' : 'false'"
                            :aria-label="`${n} ${getStarsLabel(n)}`"
                            :class="['star', { on: n <= (hover || form.rating), picked: n === form.rating }]"
                            @mouseenter="hover = n" @focus="hover = n" @blur="hover = 0" @click="pick(n)">
                            <i class="fa-solid fa-star"></i>
                        </button>
                    </div>
                    <span :class="['rating-label', { muted: !(hover || form.rating) }]">{{ ratingLabel }}</span>
                </div>

                <label class="tt-field comment">
                    <span class="tt-field-label">Комментарий</span>
                    <textarea v-model="form.comment" class="tt-input" rows="6" maxlength="2000"
                        placeholder="Что понравилось, что стоит улучшить…"></textarea>
                    <span class="counter">{{ form.comment.length }} / 2000</span>
                </label>

                <p v-if="error" class="tt-form-error" role="alert">
                    <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
                </p>

                <button type="submit" class="tt-btn tt-btn--primary submit" :disabled="sending">
                    <i v-if="sending" class="fa-solid fa-spinner fa-spin"></i>
                    {{ sending ? 'Отправляю…' : 'Отправить отзыв' }}
                    <span v-if="!sending" class="tt-arrow" aria-hidden="true">→</span>
                </button>
            </form>

            <div v-else key="thanks" class="thanks" role="status">
                <svg class="thanks-check" viewBox="0 0 80 80" aria-hidden="true">
                    <circle cx="40" cy="40" r="36" pathLength="1" />
                    <path d="M24 41 L35 52 L57 29" pathLength="1" />
                </svg>
                <h3>Спасибо за отзыв!</h3>
                <p>Он уже у команды — так мы понимаем, что улучшать в первую очередь.</p>
                <button type="button" class="tt-btn tt-btn--ghost tt-btn--sm" @click="success = false">
                    Написать ещё один
                </button>
            </div>
        </transition>
    </div>
</template>

<script>
const LABELS = ['', 'Очень плохо', 'Плохо', 'Нормально', 'Хорошо', 'Отлично!'];

export default {
    name: 'CommentMenu',
    props: {
        user: { type: Object, default: null } // из cookie: email, first_name и т.д.
    },
    data() {
        return {
            form: {
                rating: 0,
                comment: ''
            },
            hover: 0,
            sending: false,
            success: false,
            error: null
        };
    },
    computed: {
        ratingLabel() {
            const value = this.hover || this.form.rating;
            return value ? LABELS[value] : 'Выберите от 1 до 5 звёзд';
        }
    },
    methods: {
        getStarsLabel(n) {
            if (n === 1) return 'звезда';
            if (n >= 2 && n <= 4) return 'звезды';
            return 'звёзд';
        },
        pick(n) {
            this.form.rating = n;
            this.error = null;
        },
        async submitFeedback() {
            if (!this.form.rating) {
                this.error = 'Поставьте оценку — от 1 до 5 звёзд.';
                return;
            }
            if (!this.form.comment.trim()) {
                this.error = 'Напишите пару слов — что понравилось или что улучшить.';
                return;
            }

            this.sending = true;
            this.error = null;
            try {
                const response = await fetch('/api/send-feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        rating: this.form.rating,
                        comment: this.form.comment.trim(),
                        clientEmail: (this.user && this.user.email) || 'не указан',
                        clientName: `${(this.user && this.user.first_name) || ''} ${(this.user && this.user.last_name) || ''}`.trim()
                    })
                });
                const result = await response.json().catch(() => ({}));
                if (!response.ok || !result.success) throw new Error(result.error || 'Не удалось отправить отзыв.');

                this.form = { rating: 0, comment: '' };
                this.success = true;
            } catch (error) {
                console.error('Ошибка отправки отзыва:', error);
                this.error = error.message === 'Failed to fetch'
                    ? 'Нет связи с сервером. Проверьте соединение.'
                    : error.message;
            } finally {
                this.sending = false;
            }
        }
    }
};
</script>

<style scoped>
.feedback {
    max-width: 760px;
}

.form {
    display: grid;
    gap: 22px;
}

/* ---------- звёзды ---------- */

.rating {
    display: grid;
    justify-items: start;
    gap: 10px;
}

.stars {
    display: flex;
    gap: 6px;
}

.star {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    margin: 0;
    padding: 0;
    border: 1px solid var(--tt-line-brand);
    border-radius: var(--tt-radius-tile);
    background-color: var(--tt-bg-soft);
    color: var(--tt-field);
    font-size: 22px;
    cursor: pointer;
    transition:
        transform 0.35s cubic-bezier(0.2, 1.3, 0.3, 1),
        color 0.2s ease,
        background-color 0.2s ease,
        border-color 0.2s ease;
}

.star.on {
    border-color: transparent;
    background: var(--tt-gradient-brand);
    color: #ffffff;
}

.star:hover {
    transform: translateY(-3px) rotate(-8deg) scale(1.06);
}

/* Выбранная звезда «подпрыгивает» */
.star.picked {
    animation: star-pop 0.45s cubic-bezier(0.2, 1.3, 0.3, 1);
}

@keyframes star-pop {
    40% {
        transform: scale(1.22) rotate(-10deg);
    }
}

.rating-label {
    min-height: 1.4em;
    color: var(--tt-brand-deep);
    font-size: 15px;
    font-weight: 700;
}

.rating-label.muted {
    color: var(--tt-muted);
    font-weight: 500;
}

/* ---------- комментарий ---------- */

.comment {
    position: relative;
    margin: 0;
}

.comment .tt-input {
    min-height: 150px;
    padding-bottom: 28px;
}

.counter {
    position: absolute;
    right: 14px;
    bottom: 10px;
    color: var(--tt-muted);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    pointer-events: none;
}

.tt-form-error {
    margin: 0;
}

.submit {
    justify-self: start;
}

/* ---------- спасибо ---------- */

.thanks {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 24px 0 10px;
    text-align: center;
}

.thanks-check {
    width: 96px;
    height: 96px;
    margin-bottom: 6px;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.thanks-check circle {
    stroke: var(--tt-brand);
    stroke-width: 4;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: check-draw 0.7s var(--tt-ease) forwards;
}

.thanks-check path {
    stroke: var(--tt-brand);
    stroke-width: 6;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: check-draw 0.45s var(--tt-ease) 0.55s forwards;
}

@keyframes check-draw {
    to {
        stroke-dashoffset: 0;
    }
}

.thanks h3 {
    margin: 0;
    color: var(--tt-ink);
    font-size: 26px;
    font-weight: 700;
}

.thanks p {
    max-width: 380px;
    margin: 0 0 10px;
    color: var(--tt-soft);
    font-size: 15px;
    line-height: 1.6;
}

@media (max-width: 480px) {
    .star {
        width: 46px;
        height: 46px;
        font-size: 19px;
    }

    .submit {
        justify-self: stretch;
    }
}

@media (prefers-reduced-motion: reduce) {
    .star {
        transition: none;
    }

    .star:hover {
        transform: none;
    }

    .star.picked {
        animation: none;
    }

    .thanks-check circle,
    .thanks-check path {
        animation: none;
        stroke-dashoffset: 0;
    }
}
</style>
