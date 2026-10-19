<template>
    <transition name="tt-modal" :duration="{ enter: 450, leave: 200 }">
        <div v-if="open" class="tt-modal-overlay" @click.self="cancel" @keydown.esc="cancel">
            <div class="tt-modal confirm" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"
                aria-describedby="confirm-text">
                <span :class="['confirm-icon', { 'confirm-icon--danger': danger }]" aria-hidden="true">
                    <i :class="icon"></i>
                </span>

                <h2 id="confirm-title" class="confirm-title">{{ title }}</h2>
                <div id="confirm-text" class="confirm-text">
                    <slot>{{ text }}</slot>
                </div>

                <div class="confirm-actions">
                    <button ref="cancel" type="button" class="tt-btn tt-btn--ghost tt-btn--sm" :disabled="busy"
                        @click="cancel">
                        {{ cancelLabel }}
                    </button>
                    <button type="button" :class="['tt-btn', 'tt-btn--sm', danger ? 'tt-btn--danger' : 'tt-btn--primary']"
                        :disabled="busy" @click="$emit('confirm')">
                        <i v-if="busy" class="fa-solid fa-spinner fa-spin"></i>
                        {{ confirmLabel }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
// Подтверждение действия вместо системного confirm(): в тон сайту и с понятными кнопками.
// Фокус сразу на «Оставить» — случайный Enter ничего не удалит
export default {
    name: 'ConfirmDialog',
    props: {
        open: { type: Boolean, default: false },
        title: { type: String, required: true },
        text: { type: String, default: '' },
        confirmLabel: { type: String, default: 'Подтвердить' },
        cancelLabel: { type: String, default: 'Отмена' },
        icon: { type: String, default: 'fa-solid fa-triangle-exclamation' },
        danger: { type: Boolean, default: false },
        // Пока запрос идёт, кнопки заблокированы
        busy: { type: Boolean, default: false }
    },
    watch: {
        open(value) {
            if (!value) return;
            this.$nextTick(() => {
                if (this.$refs.cancel) this.$refs.cancel.focus();
            });
        }
    },
    methods: {
        cancel() {
            if (!this.busy) this.$emit('cancel');
        }
    }
};
</script>

<style scoped>
.confirm {
    width: min(440px, 100%);
    padding: 32px 28px 28px;
    text-align: center;
}

.confirm-icon {
    position: relative;
    display: grid;
    place-items: center;
    width: 64px;
    height: 64px;
    margin: 0 auto 18px;
    border-radius: 50%;
    background-color: var(--tt-brand-tint);
    color: var(--tt-brand);
    font-size: 24px;
}

/* Расходящееся кольцо — мягко привлекает внимание */
.confirm-icon::after {
    content: "";
    position: absolute;
    inset: -6px;
    border: 2px solid currentColor;
    border-radius: 50%;
    opacity: 0;
    animation: confirm-ring 1.8s ease-out infinite;
}

@keyframes confirm-ring {
    0% {
        opacity: 0.45;
        transform: scale(0.85);
    }

    100% {
        opacity: 0;
        transform: scale(1.25);
    }
}

.confirm-icon--danger {
    background-color: rgba(220, 38, 38, 0.1);
    color: #dc2626;
}

.confirm-title {
    margin: 0 0 10px;
    color: var(--tt-ink);
    font-size: 22px;
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.01em;
}

.confirm-text {
    margin: 0 0 24px;
    color: var(--tt-soft);
    font-size: 15px;
    line-height: 1.6;
}

.confirm-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.confirm-actions .tt-btn {
    padding: 0 14px;
}

@media (prefers-reduced-motion: reduce) {
    .confirm-icon::after {
        animation: none;
    }
}
</style>
