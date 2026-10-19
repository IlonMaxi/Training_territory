<template>
    <section class="tt-container" :aria-label="title">
        <Reveal class="cta" :y="26" :scale="0.97" :blur="6" :duration="920" :amount="0.18">
            <!-- Фон из линий: тонкая сетка и кардиограмма через весь блок -->
            <svg class="cta-lines" viewBox="0 0 1200 420" preserveAspectRatio="none" aria-hidden="true">
                <path class="grid" :d="gridPath" />
                <path class="ecg ecg--base" pathLength="1" :d="ecgPath" />
                <path class="ecg ecg--pulse" pathLength="1" :d="ecgPath" />
            </svg>

            <div class="layout">
                <div class="text">
                    <h2 class="title">{{ title }}</h2>
                    <div class="divider"></div>
                    <p class="lead">{{ text }}</p>

                    <div class="actions">
                        <button type="button" class="tt-btn tt-btn--light" @click="$emit('register')">
                            Создать аккаунт <span class="tt-arrow" aria-hidden="true">→</span>
                        </button>
                        <button type="button" class="tt-btn tt-btn--outline-light" @click="$emit('login')">
                            Войти
                        </button>
                    </div>
                </div>

                <!-- Сердце из линий в кольце секундомера; от него расходятся волны пульса -->
                <div class="visual" aria-hidden="true">
                    <svg viewBox="0 0 320 320" fill="none">
                        <circle class="wave" cx="160" cy="160" r="96" />
                        <circle class="wave wave--late" cx="160" cy="160" r="96" />
                        <circle class="dial" pathLength="1" cx="160" cy="160" r="128" />
                        <circle class="dial-progress" pathLength="1" cx="160" cy="160" r="142" />
                        <g class="dial-ticks">
                            <line v-for="tick in ticks" :key="tick.key" :class="['tick', { 'tick--major': tick.major }]"
                                :x1="tick.x1" :y1="tick.y1" :x2="tick.x2" :y2="tick.y2" />
                        </g>
                        <g class="heart">
                            <path class="heart-line" pathLength="1"
                                d="M160 214 C 120 186, 98 162, 100 136 C 102 114, 120 101, 138 103 C 148 104, 156 111, 160 120 C 164 111, 172 104, 182 103 C 200 101, 218 114, 220 136 C 222 162, 200 186, 160 214 Z" />
                            <path class="heart-ecg" pathLength="1"
                                d="M92 152 L126 152 L134 140 L144 170 L156 116 L168 182 L176 152 L228 152" />
                        </g>
                    </svg>
                </div>
            </div>
        </Reveal>
    </section>
</template>

<script>
import Reveal from '@/components/ui/Reveal.vue';

export default {
    name: 'CtaSection',
    components: { Reveal },
    props: {
        title: { type: String, required: true },
        text: { type: String, required: true }
    },
    data() {
        // Сетка 60×60 в координатах фона (1200×420, растягивается на весь блок)
        const grid = [];
        for (let x = 60; x < 1200; x += 60) grid.push(`M${x} 0V420`);
        for (let y = 60; y < 420; y += 60) grid.push(`M0 ${y}H1200`);

        // 48 делений вокруг сердца, каждое четвёртое длиннее
        const ticks = Array.from({ length: 48 }, (_, index) => {
            const angle = (index * 7.5 - 90) * Math.PI / 180;
            const major = index % 4 === 0;
            const point = (radius) => [
                Math.round((160 + radius * Math.cos(angle)) * 10) / 10,
                Math.round((160 + radius * Math.sin(angle)) * 10) / 10
            ];
            const [x1, y1] = point(major ? 112 : 117);
            const [x2, y2] = point(122);
            return { key: index, major, x1, y1, x2, y2 };
        });

        return {
            gridPath: grid.join(' '),
            // Ровная линия у нижнего края (под кнопками) с одним «ударом» под сердцем
            ecgPath: 'M0 408 L780 408 L800 396 L816 414 L838 316 L862 418 L880 400 L898 408 L1200 408',
            ticks
        };
    }
};
</script>

<style scoped>
.cta {
    position: relative;
    overflow: hidden;
    padding: 48px;
    border: 1px solid rgba(248, 80, 10, 0.3);
    border-radius: var(--tt-radius-xl);
    background:
        radial-gradient(60% 110% at 82% 45%, rgba(248, 80, 10, 0.55) 0%, rgba(248, 80, 10, 0) 62%),
        radial-gradient(45% 80% at 0% 100%, rgba(55, 96, 231, 0.3) 0%, rgba(55, 96, 231, 0) 60%),
        var(--tt-gradient-navy);
    box-shadow: 0 30px 80px rgba(15, 20, 39, 0.28);
    color: #ffffff;
}

/* ---------- фон из линий ---------- */

.cta-lines {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.grid {
    stroke: rgba(255, 255, 255, 0.05);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
    -webkit-mask-image: radial-gradient(70% 90% at 70% 50%, #000 30%, transparent 85%);
    mask-image: radial-gradient(70% 90% at 70% 50%, #000 30%, transparent 85%);
}

.ecg {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
}

.ecg--base {
    stroke: rgba(255, 154, 102, 0.45);
    stroke-width: 2;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
}

.ecg--pulse {
    stroke: #ffd2b8;
    stroke-width: 3;
    stroke-dasharray: 0.08 0.92;
    stroke-dashoffset: 1;
    opacity: 0;
    filter: drop-shadow(0 0 6px rgba(255, 138, 76, 0.9));
}

/* ---------- раскладка ---------- */

.layout {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(260px, 0.55fr);
    align-items: center;
    gap: 40px;
}

.title {
    max-width: 15ch;
    margin: 0;
    color: #ffffff;
    font-size: 52px;
    font-weight: 600;
    line-height: 1.05;
    letter-spacing: -0.03em;
}

.divider {
    width: 112px;
    height: 3px;
    margin-top: 26px;
    border-radius: var(--tt-radius-pill);
    background: linear-gradient(90deg, #ff7a3d, rgba(255, 122, 61, 0));
}

.lead {
    max-width: 36rem;
    margin: 24px 0 0;
    color: rgba(255, 255, 255, 0.78);
    font-size: 18px;
    line-height: 1.65;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 36px;
}

/* ---------- сердце в кольце ---------- */

.visual {
    display: flex;
    justify-content: center;
}

.visual svg {
    width: 100%;
    max-width: 320px;
    height: auto;
    overflow: visible;
}

.dial,
.dial-progress,
.heart-line,
.heart-ecg {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
}

.dial {
    stroke: rgba(255, 255, 255, 0.22);
    stroke-width: 1.4;
}

/* Прогресс стартует сверху, поэтому круг повёрнут на четверть */
.dial-progress {
    stroke: #ff7a3d;
    stroke-width: 4;
    transform: rotate(-90deg);
    transform-origin: 160px 160px;
}

.dial-ticks {
    transform-origin: 160px 160px;
}

.tick {
    stroke: rgba(255, 255, 255, 0.28);
    stroke-width: 1.4;
    stroke-linecap: round;
    opacity: 0;
}

.tick--major {
    stroke: rgba(255, 154, 102, 0.9);
    stroke-width: 2.2;
}

.heart {
    transform-origin: 160px 158px;
}

.heart-line {
    stroke: #ff8a4c;
    stroke-width: 3.2;
}

.heart-ecg {
    stroke: #ffffff;
    stroke-width: 2.6;
}

.wave {
    fill: none;
    stroke: rgba(255, 138, 76, 0.6);
    stroke-width: 1.6;
    opacity: 0;
    transform-origin: 160px 160px;
}

/* ---------- сборка при появлении ---------- */

.title,
.divider,
.lead,
.actions {
    opacity: 0;
}

.cta[data-sr-revealed="true"] .title {
    animation: title-in 900ms 240ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.cta[data-sr-revealed="true"] .divider {
    animation: divider-in 700ms 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.cta[data-sr-revealed="true"] .lead {
    animation: lift-in 700ms 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.cta[data-sr-revealed="true"] .actions {
    animation: pop-in 620ms 680ms cubic-bezier(0.2, 1.2, 0.3, 1) both;
}

.cta[data-sr-revealed="true"] .ecg--base {
    animation: draw 2.2s 200ms cubic-bezier(0.65, 0, 0.35, 1) forwards;
}

.cta[data-sr-revealed="true"] .ecg--pulse {
    animation: pulse-run 3.2s linear 2.4s infinite;
}

.cta[data-sr-revealed="true"] .dial {
    animation: draw 1.4s 300ms cubic-bezier(0.65, 0, 0.35, 1) forwards;
}

.cta[data-sr-revealed="true"] .tick {
    animation: fade-in 0.5s ease-out 0.9s forwards;
}

.cta[data-sr-revealed="true"] .dial-ticks {
    animation: spin 60s linear 1.4s infinite;
}

/* Кольцо прогресса набегает до трёх четвертей — «цель почти достигнута» */
.cta[data-sr-revealed="true"] .dial-progress {
    animation: progress-fill 1.8s 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.cta[data-sr-revealed="true"] .heart-line {
    animation: draw 1.6s 500ms cubic-bezier(0.65, 0, 0.35, 1) forwards;
}

.cta[data-sr-revealed="true"] .heart-ecg {
    animation: draw 1s 1.6s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}

/* Сердце бьётся «тук-тук», от него расходятся две волны */
.cta[data-sr-revealed="true"] .heart {
    animation: heartbeat 1.6s ease-in-out 2.4s infinite;
}

.cta[data-sr-revealed="true"] .wave {
    animation: wave 1.6s ease-out 2.4s infinite;
}

.cta[data-sr-revealed="true"] .wave--late {
    animation-delay: 2.65s;
}

@keyframes draw {
    to {
        stroke-dashoffset: 0;
    }
}

@keyframes fade-in {
    to {
        opacity: 1;
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@keyframes progress-fill {
    to {
        stroke-dashoffset: 0.26;
    }
}

@keyframes pulse-run {
    0% {
        stroke-dashoffset: 1;
        opacity: 0;
    }

    8%,
    85% {
        opacity: 1;
    }

    100% {
        stroke-dashoffset: 0;
        opacity: 0;
    }
}

@keyframes heartbeat {

    0%,
    40%,
    100% {
        transform: scale(1);
    }

    10% {
        transform: scale(1.09);
    }

    20% {
        transform: scale(0.98);
    }

    30% {
        transform: scale(1.06);
    }
}

@keyframes wave {
    0% {
        opacity: 0.7;
        transform: scale(0.9);
    }

    100% {
        opacity: 0;
        transform: scale(1.7);
    }
}

@keyframes title-in {
    0% {
        opacity: 0;
        clip-path: inset(-0.3em -0.6em calc(100% + 0.3em) -0.6em);
        transform: translate3d(0, 24px, 0);
    }

    100% {
        opacity: 1;
        clip-path: inset(-0.3em -0.6em -0.35em -0.6em);
        transform: none;
    }
}

@keyframes divider-in {
    from {
        opacity: 0;
        transform: scaleX(0.1);
        transform-origin: left center;
    }

    to {
        opacity: 1;
        transform: none;
        transform-origin: left center;
    }
}

@keyframes lift-in {
    from {
        opacity: 0;
        transform: translate3d(0, 18px, 0);
    }

    to {
        opacity: 1;
        transform: none;
    }
}

@keyframes pop-in {
    0% {
        opacity: 0;
        transform: translate3d(0, 14px, 0) scale(0.9);
    }

    70% {
        opacity: 1;
        transform: translate3d(0, -2px, 0) scale(1.03);
    }

    100% {
        opacity: 1;
        transform: none;
    }
}

/* ---------- адаптив и доступность ---------- */

@media (max-width: 1023px) {
    .layout {
        grid-template-columns: minmax(0, 1fr);
    }

    .visual {
        display: none;
    }

    .title {
        font-size: 42px;
    }
}

@media (max-width: 640px) {
    .cta {
        padding: 28px 20px;
    }

    .title {
        font-size: 30px;
    }

    .divider {
        width: 64px;
        margin-top: 18px;
    }

    .lead {
        margin-top: 18px;
        font-size: 15px;
    }

    .actions {
        flex-direction: column;
        margin-top: 26px;
    }

    .actions .tt-btn {
        width: 100%;
    }
}

@media (prefers-reduced-motion: reduce) {

    .title,
    .divider,
    .lead,
    .actions,
    .tick {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
        clip-path: none !important;
    }

    .ecg--base,
    .dial,
    .heart-line,
    .heart-ecg {
        animation: none !important;
        stroke-dashoffset: 0;
    }

    .dial-progress {
        animation: none !important;
        stroke-dashoffset: 0.26;
    }

    .ecg--pulse,
    .heart,
    .wave,
    .dial-ticks {
        animation: none !important;
    }
}
</style>
