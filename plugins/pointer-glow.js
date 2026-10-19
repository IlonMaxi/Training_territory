import Vue from 'vue';

/*
  v-glow — карточка реагирует на курсор: под указателем зажигается мягкое
  свечение, а сама карточка чуть наклоняется к нему (порт PointerGlow
  с лендинга). Стили — класс .pointer-glow в assets/design.css; его нужно
  поставить на элемент в шаблоне, директива только пишет CSS-переменные.

  v-glow                         — наклон 6°, оранжевое свечение
  v-glow="{ tilt: 0 }"           — только свечение
  v-glow="{ color: 'rgba(...)'}" — другой цвет свечения
*/

const prefersReducedMotion = () =>
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

Vue.directive('glow', {
    bind(el, binding) {
        const options = Object.assign({ tilt: 6, color: null }, binding.value);
        if (options.color) el.style.setProperty('--glow-color', options.color);

        let frame = null;

        const onMove = (event) => {
            // На тач-экранах наклон только мешает прокрутке
            if (event.pointerType === 'touch' || prefersReducedMotion()) return;

            const rect = el.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width;
            const py = (event.clientY - rect.top) / rect.height;

            if (frame !== null) cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                el.style.setProperty('--glow-x', `${px * 100}%`);
                el.style.setProperty('--glow-y', `${py * 100}%`);
                el.style.setProperty('--glow-opacity', '1');

                if (options.tilt > 0) {
                    const rx = (0.5 - py) * options.tilt * 2;
                    const ry = (px - 0.5) * options.tilt * 2;
                    el.style.setProperty(
                        '--tilt',
                        `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
                    );
                }
            });
        };

        const onLeave = () => {
            if (frame !== null) cancelAnimationFrame(frame);
            el.style.setProperty('--glow-opacity', '0');
            el.style.setProperty('--tilt', 'perspective(900px) rotateX(0) rotateY(0)');
        };

        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerleave', onLeave);
        el._pointerGlow = { onMove, onLeave };
    },
    unbind(el) {
        const handlers = el._pointerGlow;
        if (!handlers) return;
        el.removeEventListener('pointermove', handlers.onMove);
        el.removeEventListener('pointerleave', handlers.onLeave);
        delete el._pointerGlow;
    }
});
