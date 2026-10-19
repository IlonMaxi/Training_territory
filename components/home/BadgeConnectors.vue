<template>
    <!-- «Линия пульса» по левому полю: соединяет бейджи секций и прорисовывается
         при прокрутке, посередине каждого перехода — удар кардиограммы.
         Только на широких экранах: на узких для неё нет поля. -->
    <svg v-if="size.w >= desktopBreakpoint" class="connectors" :width="size.w" :height="size.h"
        :viewBox="`0 0 ${size.w} ${size.h}`" fill="none" aria-hidden="true">
        <defs>
            <linearGradient :id="gradientId" x1="0" y1="0" x2="0" :y2="size.h" gradientUnits="userSpaceOnUse">
                <stop stop-color="#ffb38a" />
                <stop offset="0.4" stop-color="#f8500a" />
                <stop offset="1" stop-color="#c2410c" />
            </linearGradient>
            <filter :id="glowId" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        <g v-for="(d, index) in segments" :key="index">
            <path :d="d" stroke="#f8500a" stroke-opacity="0.1" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            <path ref="paths" :d="d" pathLength="1" :stroke="`url(#${gradientId})`" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round" class="connector-path" />
            <circle ref="heads" r="4.5" fill="#ff7a3d" opacity="0" :filter="`url(#${glowId})`"
                class="connector-head" />
        </g>
    </svg>
</template>

<script>
const DESKTOP_BREAKPOINT = 768;
// Насколько левее бейджей идёт линия
const LANE_GUTTER = 52;
// Радиус скругления на поворотах
const CORNER = 14;
// Высота кардиограммы на вертикальном участке
const BEAT_HEIGHT = 86;

const rounded = (value) => Math.round(value * 10) / 10;

let instanceCounter = 0;

// Координаты без учёта transform: анимация появления сдвигает бейджи,
// а линия должна целиться в их итоговое место
function layoutRect(el, root) {
    let x = 0;
    let y = 0;
    let node = el;

    while (node instanceof HTMLElement && node !== root) {
        x += node.offsetLeft;
        y += node.offsetTop;
        node = node.offsetParent;
    }

    return {
        left: x,
        top: y,
        height: el.offsetHeight
    };
}

// От бейджа влево, вниз по полю и вправо к следующему бейджу.
// Посередине вертикали — удар: P-зубец, QRS-комплекс, T-зубец.
// Высокий зубец R уходит наружу, в пустое поле, а не на текст.
function pulsePath(a, b) {
    const lane = Math.max(32, Math.min(a.left, b.left) - LANE_GUTTER);
    const y1 = a.cy;
    const y2 = b.cy;
    const beat = Math.max(y1 + CORNER, (y1 + y2) / 2 - BEAT_HEIGHT / 2);
    const p = (x, y) => `${rounded(x)} ${rounded(y)}`;

    return [
        `M ${p(a.left, y1)}`,
        `L ${p(lane + CORNER, y1)}`,
        `Q ${p(lane, y1)} ${p(lane, y1 + CORNER)}`,
        `L ${p(lane, beat)}`,
        `Q ${p(lane - 8, beat + 8)} ${p(lane, beat + 16)}`,
        `L ${p(lane, beat + 26)}`,
        `L ${p(lane + 5, beat + 30)}`,
        `L ${p(lane - 26, beat + 40)}`,
        `L ${p(lane + 18, beat + 50)}`,
        `L ${p(lane, beat + 56)}`,
        `L ${p(lane, beat + 64)}`,
        `Q ${p(lane - 12, beat + 75)} ${p(lane, beat + BEAT_HEIGHT)}`,
        `L ${p(lane, y2 - CORNER)}`,
        `Q ${p(lane, y2)} ${p(lane + CORNER, y2)}`,
        `L ${p(b.left, y2)}`
    ].join(' ');
}

export default {
    name: 'BadgeConnectors',
    data() {
        instanceCounter += 1;
        return {
            size: { w: 0, h: 0 },
            segments: [],
            desktopBreakpoint: DESKTOP_BREAKPOINT,
            gradientId: `pulse-line-gradient-${instanceCounter}`,
            glowId: `pulse-line-glow-${instanceCounter}`
        };
    },
    watch: {
        // Пути перерисованы — сразу выставляем прогресс по текущей прокрутке
        segments() {
            this.$nextTick(this.update);
        }
    },
    mounted() {
        // Холст — родительский <main>: бейджи ищем в нём, линии кладём поверх
        this.root = this.$el.parentElement;
        this.anchors = [];
        this.reducedMotion = typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.build();
        this.resizeObserver = new ResizeObserver(() => this.build());
        this.resizeObserver.observe(this.root);
        // Картинки и шрифты догружаются и сдвигают бейджи
        this.delayedBuild = window.setTimeout(() => this.build(), 500);

        this.onScroll = () => {
            if (this.ticking) return;
            this.ticking = true;
            window.requestAnimationFrame(() => {
                this.ticking = false;
                this.update();
            });
        };
        window.addEventListener('scroll', this.onScroll, { passive: true });
        window.addEventListener('resize', this.onScroll);
    },
    beforeDestroy() {
        if (this.resizeObserver) this.resizeObserver.disconnect();
        window.clearTimeout(this.delayedBuild);
        window.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('resize', this.onScroll);
    },
    methods: {
        build() {
            const root = this.root;
            if (!root) return;

            const anchors = Array.from(root.querySelectorAll('[data-connector-anchor]'));
            this.anchors = anchors;

            const measured = anchors.map((el) => {
                const rect = layoutRect(el, root);
                return { left: rect.left, cy: rect.top + rect.height / 2 };
            });

            this.segments = measured.slice(0, -1).map((point, index) => pulsePath(point, measured[index + 1]));
            this.size = { w: root.offsetWidth, h: root.scrollHeight };
        },
        update() {
            const paths = this.$refs.paths || [];
            const heads = this.$refs.heads || [];
            const threshold = window.innerHeight * 0.58;

            paths.forEach((path, index) => {
                const head = heads[index];
                const from = this.anchors[index];
                const to = this.anchors[index + 1];
                if (!path || !from || !to) return;

                // Линия растёт, пока «окно внимания» (58% высоты экрана)
                // проходит путь от нижнего края бейджа до верхнего края следующего
                const topY = from.getBoundingClientRect().bottom;
                const bottomY = to.getBoundingClientRect().top;
                const span = Math.max(1, bottomY - topY);
                const progress = this.reducedMotion
                    ? 1
                    : Math.min(1, Math.max(0, (threshold - topY) / span));

                path.style.strokeDashoffset = String(1 - progress);

                if (!head) return;
                if (progress <= 0.01 || progress >= 0.995 || this.reducedMotion) {
                    head.style.opacity = '0';
                } else {
                    const point = path.getPointAtLength(path.getTotalLength() * progress);
                    head.setAttribute('cx', String(point.x));
                    head.setAttribute('cy', String(point.y));
                    head.style.opacity = '0.9';
                }
            });
        }
    }
};
</script>

<style scoped>
.connectors {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    overflow: visible;
    pointer-events: none;
}

.connector-path {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    transition: stroke-dashoffset 0.12s linear;
}

.connector-head {
    transition: opacity 0.16s ease;
}
</style>
