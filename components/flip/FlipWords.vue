<template>
    <div class="flip-words">
        <transition name="pixel-fade" mode="out-in">
            <span class="pixel-text" :key="currentWordIndex">
                {{ words[currentWordIndex] }}
            </span>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'FlipWords',
    props: {
        words: {
            type: Array,
            required: true
        },
        interval: {
            type: Number,
            default: 3000
        }
    },
    data() {
        return {
            currentWordIndex: 0,
            timer: null
        };
    },
    mounted() {
        this.startFlipping();
    },
    beforeDestroy() {
        this.stopFlipping();
    },
    methods: {
        startFlipping() {
            // Компонент пересоздаётся при переключении «Тренеру/Клиенту»,
            // поэтому старый таймер обязательно гасим — иначе они копятся
            this.stopFlipping();
            if (this.words.length < 2) return;

            this.timer = setInterval(() => {
                this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
            }, this.interval);
        },
        stopFlipping() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }
    }
};
</script>

<style scoped>
.flip-words {
    font-size: var(--text-h3);
    font-weight: var(--weight-bold);
    display: inline-block;
    position: relative;
}

.pixel-text {
    display: inline-block;
}

/*
  Анимация целиком на CSS. Раньше JS-хуки писали инлайновые стили поверх этих
  классов, и обе системы боролись за opacity/transform/filter с разной
  длительностью — отсюда рывки.
*/
.pixel-fade-enter-active {
    transition: opacity 0.45s ease, transform 0.45s ease, filter 0.45s ease;
}

.pixel-fade-leave-active {
    transition: opacity 0.35s ease, transform 0.35s ease, filter 0.35s ease;
}

.pixel-fade-enter,
.pixel-fade-leave-to {
    opacity: 0;
    transform: scale(1.15);
    filter: blur(8px);
}

.pixel-fade-enter-to,
.pixel-fade-leave {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
}

@media (prefers-reduced-motion: reduce) {

    .pixel-fade-enter-active,
    .pixel-fade-leave-active {
        transition: none;
    }
}
</style>
