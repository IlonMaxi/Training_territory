<script>
import { isInView, observeReveal, unobserveReveal } from '@/components/utils/revealObserver.js';

// Варианты те же, что у ScrollReveal на лендинге; lift — базовый, без доп. класса
const VARIANT_CLASSES = {
    lift: '',
    tilt: 'sr-tilt',
    wipe: 'sr-wipe',
    wipeX: 'sr-wipe-x',
    dropZ: 'sr-drop-z',
    bubble: 'sr-bubble',
    bubbleSoft: 'sr-bubble-soft',
    slideInLeft: 'sr-slide-in-left',
    slideInRight: 'sr-slide-in-right'
};

/*
  Блок, который «проявляется» при прокрутке, — порт ScrollReveal с лендинга.
  На сервере рендерится уже скрытым (data-sr-revealed="false"), поэтому при
  загрузке содержимое не мелькает перед анимацией. Тег задаётся через as,
  классы и атрибуты родителя ложатся на этот же элемент — лишней обёртки нет.
*/
export default {
    name: 'Reveal',
    props: {
        as: { type: String, default: 'div' },
        variant: { type: String, default: 'lift' },
        once: { type: Boolean, default: true },
        // Какая доля блока должна попасть в окно, чтобы он проявился
        amount: { type: Number, default: 0.25 },
        delay: { type: Number, default: null },
        duration: { type: Number, default: null },
        x: { type: Number, default: null },
        y: { type: Number, default: null },
        scale: { type: Number, default: null },
        blur: { type: Number, default: null }
    },
    data() {
        return { revealed: false };
    },
    computed: {
        revealVars() {
            const vars = {};
            if (this.duration !== null) vars['--sr-duration'] = `${this.duration}ms`;
            if (this.delay !== null) vars['--sr-delay'] = `${this.delay}ms`;
            if (this.x !== null) vars['--sr-x-from'] = `${this.x}px`;
            if (this.y !== null) vars['--sr-y-from'] = `${this.y}px`;
            if (this.scale !== null) vars['--sr-scale-from'] = String(this.scale);
            if (this.blur !== null) vars['--sr-blur'] = `${this.blur}px`;
            return vars;
        }
    },
    mounted() {
        // Уже на экране — проявляем сразу, наблюдатель не нужен
        if (isInView(this.$el, this.amount)) {
            this.revealed = true;
            if (this.once) return;
        }

        observeReveal(this.$el, this.amount, (visible) => {
            if (visible) {
                this.revealed = true;
                if (this.once) unobserveReveal(this.$el);
            } else if (!this.once) {
                this.revealed = false;
            }
        });
    },
    beforeDestroy() {
        unobserveReveal(this.$el);
    },
    render(h) {
        return h(this.as, {
            class: ['sr-reveal', VARIANT_CLASSES[this.variant]],
            style: this.revealVars,
            attrs: { 'data-sr-revealed': this.revealed ? 'true' : 'false' }
        }, this.$slots.default);
    }
};
</script>
