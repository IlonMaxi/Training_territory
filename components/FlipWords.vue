<template>
    <div class="flip-words">
        <transition name="pixel-fade" @before-enter="beforeEnter" @enter="enter" @leave="leave" mode="out-in">
            <span class="pixel-text" :key="currentWordIndex">
                {{ words[currentWordIndex] }}
            </span>
        </transition>
    </div>
</template>

<script>
export default {
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
            currentWordIndex: 0
        };
    },
    mounted() {
        this.startFlipping();
    },
    methods: {
        startFlipping() {
            setInterval(() => {
                this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
            }, this.interval); // Интервал для смены слов
        },
        beforeEnter(el) {
            el.style.opacity = 0;
            el.style.transform = 'scale(1.3)';
            el.style.filter = 'blur(10px)';
        },
        enter(el, done) {
            el.offsetHeight; // Перерисовка элемента
            el.style.transition = 'opacity 0.8s ease, transform 0.8s ease, filter 0.8s ease';
            el.style.opacity = 1;
            el.style.transform = 'scale(1)';
            el.style.filter = 'blur(0px)';
            setTimeout(() => {
                done();
            }, 800); // Завершение анимации появления
        },
        leave(el, done) {
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease, filter 0.5s ease';
            el.style.opacity = 0;
            el.style.transform = 'scale(1.3)';
            el.style.filter = 'blur(10px)';
            el.classList.add('pixelate');
            // Удаление класса после анимации
            setTimeout(() => {
                el.classList.remove('pixelate');
                done();
            }, 500); // Длительность анимации рассыпания
        }
    }
};
</script>

<style scoped>
.flip-words {
    font-size: 2rem;
    font-weight: bold;
    display: inline-block;
    position: relative;
}

.pixel-text {
    display: inline-block;
}

.pixel-fade-enter-active,
.pixel-fade-leave-active {
    transition: opacity 0.5s ease, transform 0.5s ease, filter 0.5s ease;
}

.pixel-fade-enter,
.pixel-fade-leave-to {
    transform: scale(1.1);
    opacity: 0;
    filter: blur(10px);
}

.pixel-text.pixelate {
    animation: pixelate 0.5s ease both;
}

@keyframes pixelate {
    0% {
        transform: scale(1);
        opacity: 1;
        filter: blur(0);
    }

    50% {
        opacity: 0.8;
        filter: blur(3px);
        transform: scale(1.1);
    }

    100% {
        transform: scale(1.1);
        opacity: 0;
        filter: blur(10px);
    }
}
</style>