<template>
    <span class="flip-words">
        <transition name="word-roll" mode="out-in">
            <span class="word" :key="currentWordIndex">
                {{ words[currentWordIndex] }}
            </span>
        </transition>
    </span>
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
/* Размер и цвет — от заголовка, в который вставлено слово. Строчный элемент:
   у inline-block поля «ореола» .accent-word раздували бы высоту строки */
.flip-words {
    display: inline;
}

.word {
    display: inline-block;
}

/*
  Анимация целиком на CSS. Раньше JS-хуки писали инлайновые стили поверх этих
  классов, и обе системы боролись за opacity/transform/filter с разной
  длительностью — отсюда рывки. Слово «прокручивается» снизу вверх.
*/
.word-roll-enter-active {
    transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), filter 0.45s ease;
}

.word-roll-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease, filter 0.3s ease;
}

.word-roll-enter {
    opacity: 0;
    transform: translateY(45%) rotateX(-40deg);
    filter: blur(6px);
}

.word-roll-leave-to {
    opacity: 0;
    transform: translateY(-45%) rotateX(40deg);
    filter: blur(6px);
}

@media (prefers-reduced-motion: reduce) {

    .word-roll-enter-active,
    .word-roll-leave-active {
        transition: none;
    }
}
</style>
