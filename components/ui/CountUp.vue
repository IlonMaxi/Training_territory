<template>
    <span>{{ prefix }}{{ formatted }}{{ suffix }}</span>
</template>

<script>
const ease = (t) => 1 - Math.pow(1 - t, 3);

/*
  Число «набегает» от нуля к итоговому, когда блок впервые попадает в окно
  (порт CountUp с лендинга). На сервере сразу итоговое значение — без JS
  цифра всё равно верная; при prefers-reduced-motion анимации нет.
*/
export default {
    name: 'CountUp',
    props: {
        value: { type: Number, required: true },
        prefix: { type: String, default: '' },
        suffix: { type: String, default: '' },
        duration: { type: Number, default: 1200 }
    },
    data() {
        return { display: this.value };
    },
    computed: {
        formatted() {
            return new Intl.NumberFormat('ru-RU').format(Math.round(this.display));
        }
    },
    mounted() {
        const reduced = typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced || typeof IntersectionObserver === 'undefined') return;

        this.display = 0;
        this.observer = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            this.observer.disconnect();
            this.run();
        }, { threshold: 0.4 });
        this.observer.observe(this.$el);
    },
    beforeDestroy() {
        if (this.observer) this.observer.disconnect();
        if (this.frame) cancelAnimationFrame(this.frame);
    },
    methods: {
        run() {
            let start = 0;
            const step = (now) => {
                if (!start) start = now;
                const progress = Math.min(1, (now - start) / this.duration);
                this.display = this.value * ease(progress);
                if (progress < 1) this.frame = requestAnimationFrame(step);
            };
            this.frame = requestAnimationFrame(step);
        }
    }
};
</script>
