<template>
    <!-- Иллюстрация: девушка из одних линий прыгает на скакалке. Скринридеру тут читать нечего -->
    <div class="fit" aria-hidden="true">
        <svg class="fit-svg" viewBox="0 -40 440 620" fill="none">
            <defs>
                <radialGradient :id="ids.glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#f8500a" stop-opacity="0.18" />
                    <stop offset="65%" stop-color="#f8500a" stop-opacity="0.05" />
                    <stop offset="100%" stop-color="#f8500a" stop-opacity="0" />
                </radialGradient>
                <filter :id="ids.spark" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.6" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <!-- Кольца активности, как на фитнес-браслете: заполняются, пока она прыгает -->
            <circle class="glow" cx="220" cy="292" r="200" :fill="`url(#${ids.glow})`" />
            <circle v-for="ring in rings" :key="`track-${ring.key}`" class="ln track" pathLength="1" cx="220" cy="292"
                :r="ring.r" :style="{ '--d': ring.delay }" />
            <circle v-for="ring in rings" :key="`act-${ring.key}`" :class="['act', `act--${ring.key}`]" pathLength="1"
                cx="220" cy="292" :r="ring.r" :style="{ '--to': ring.to, '--a': ring.lag }" />

            <!-- Пол — линия пульса, под ногами тень -->
            <path class="ln floor" pathLength="1" :d="floor" style="--d: 1.6s" />
            <path class="floor-pulse" pathLength="1" :d="floor" />
            <ellipse class="shadow" cx="220" cy="560" rx="66" ry="5" />

            <!-- Пыль от приземления — на полу, не прыгает вместе с ней -->
            <g v-for="side in sides" :key="`dust-${side.key}`" :transform="side.transform">
                <path v-for="(d, index) in dust" :key="`dust-${index}`" class="dust" :d="d" />
            </g>

            <!-- Всё, что подпрыгивает -->
            <g class="hop">
                <!-- Скакалка: половина дуги и её зеркало. Две копии позади — шлейф -->
                <g v-for="side in sides" :key="`rope-${side.key}`" :transform="side.transform">
                    <path class="rope rope--ghost-2" :d="rope" />
                    <path class="rope rope--ghost-1" :d="rope" />
                    <path class="rope" :d="rope" />
                </g>

                <!-- Хвост за головой: качается в такт прыжкам -->
                <g class="pony">
                    <path v-for="line in pony.main" :key="`pony-${line.key}`" class="ln ln--main" pathLength="1"
                        :d="line.d" :style="{ '--d': line.delay }" />
                    <path v-for="line in pony.detail" :key="`pony-detail-${line.key}`" class="ln ln--detail"
                        pathLength="1" :d="line.d" :style="{ '--d': line.delay }" />
                </g>

                <!-- Левая половина тела и её зеркало -->
                <g v-for="side in sides" :key="side.key" :transform="side.transform">
                    <path v-for="line in body.main" :key="`main-${line.key}`" class="ln ln--main" pathLength="1"
                        :d="line.d" :style="{ '--d': line.delay }" />
                    <path v-for="line in body.detail" :key="`detail-${line.key}`" class="ln ln--detail" pathLength="1"
                        :d="line.d" :style="{ '--d': line.delay }" />
                    <path v-for="line in body.sparks" :key="`spark-${line.key}`" class="spark" pathLength="1"
                        :d="line.d" :filter="`url(#${ids.spark})`" :style="{ '--s': line.delay }" />

                    <!-- Рука: плечо → локоть → кисть с ручкой скакалки -->
                    <g class="arm-upper">
                        <path v-for="line in arm.upperMain" :key="`upper-${line.key}`" class="ln ln--main"
                            pathLength="1" :d="line.d" :style="{ '--d': line.delay }" />
                        <path v-for="line in arm.upperDetail" :key="`upper-detail-${line.key}`" class="ln ln--detail"
                            pathLength="1" :d="line.d" :style="{ '--d': line.delay }" />
                        <g class="arm-fore">
                            <path v-for="line in arm.foreMain" :key="`fore-${line.key}`" class="ln ln--main"
                                pathLength="1" :d="line.d" :style="{ '--d': line.delay }" />
                            <path v-for="line in arm.foreDetail" :key="`fore-detail-${line.key}`" class="ln ln--detail"
                                pathLength="1" :d="line.d" :style="{ '--d': line.delay }" />
                            <!-- Фитнес-браслет — только на одной руке -->
                            <template v-if="side.key === 'left'">
                                <path v-for="line in arm.watch" :key="`watch-${line.key}`" class="ln ln--main watch"
                                    pathLength="1" :d="line.d" :style="{ '--d': line.delay }" />
                            </template>
                        </g>
                    </g>
                </g>

                <!-- Центр: голова, волосы, пупок -->
                <path v-for="line in center.main" :key="`center-${line.key}`" class="ln ln--main" pathLength="1"
                    :d="line.d" :style="{ '--d': line.delay }" />
                <path v-for="line in center.detail" :key="`center-detail-${line.key}`" class="ln ln--detail"
                    pathLength="1" :d="line.d" :style="{ '--d': line.delay }" />
            </g>

            <!-- Сердечки поднимаются, как пульс на кардио -->
            <g v-for="heart in hearts" :key="heart.key" :transform="`translate(${heart.x} ${heart.y}) scale(${heart.s})`">
                <path class="heart" :d="heartPath" :style="{ '--m': heart.delay }" />
            </g>
        </svg>
    </div>
</template>

<script>
/*
  Как и у бодибилдера (HeroAthlete): контуры нарисованы для левой половины
  фигуры (центр — x = 220), правая — её зеркало. Рука описана в своих
  координатах: кость вдоль оси X, плечевой сустав в (0, 0), локоть в (84, 0).
  Скакалка — в общих координатах: она крутится вокруг линии кистей (y = 310),
  поэтому руки стоят на месте, а кольцо скакалки сжимается по вертикали —
  так выглядит вращение, если смотреть спереди.
*/
const BODY_MAIN = [
    'M210 110 C 200 120, 186 124, 172 128', // трапеция
    'M172 128 C 161 130, 153 138, 152 150', // плечо
    'M172 158 C 171 170, 173 184, 177 198', // бок топа
    'M177 198 C 183 214, 189 228, 190 242', // талия
    'M190 242 C 190 262, 176 282, 168 304', // бедро-таз
    // Нога снаружи одной линией: бедро → колено → икра → щиколотка
    'M168 304 C 160 336, 163 388, 175 430 C 178 442, 168 462, 170 482 C 172 500, 178 512, 182 522',
    // Нога изнутри
    'M217 324 C 216 360, 211 400, 206 432 C 204 444, 210 458, 209 476 C 208 496, 202 510, 199 522',
    // Кроссовок: носок шире пятки, снизу подошва
    'M182 524 C 172 530, 166 542, 170 550 C 172 555, 182 557, 192 557 C 202 557, 208 555, 209 550 C 210 540, 206 530, 199 524',
    'M202 166 C 208 176, 214 180, 220 180', // вырез топа
    'M177 198 C 192 206, 206 208, 220 208' // нижний край топа
];

const BODY_DETAIL = [
    'M196 60 C 190 61, 190 72, 196 73', // ухо
    'M196 76 C 194 76, 193 78, 193 80 C 193 82, 195 83, 196 83', // серёжка-кольцо
    'M211 92 C 212 102, 212 110, 211 118', // шея
    'M190 122 C 192 140, 196 156, 202 166', // бретель топа
    'M206 216 C 204 228, 205 238, 208 248', // пресс
    'M188 258 C 200 262, 210 264, 220 264', // пояс легинсов
    'M183 272 C 197 276, 209 278, 220 278',
    'M207 316 C 212 321, 216 324, 220 324', // шов легинсов
    'M190 334 C 188 362, 190 392, 195 420', // квадрицепс
    'M183 438 C 189 442, 195 442, 200 438', // колено
    'M183 519 C 189 522, 194 522, 199 519', // манжета легинсов
    'M185 532 L197 530', // шнуровка
    'M183 538 L199 536',
    'M170 548 C 182 551, 198 551, 209 548' // подошва
];

// По этим контурам пробегает искра
const SPARK_LINES = [3, 5, 6];

const CENTER_MAIN = [
    'M195 56 C 195 76, 205 92, 220 95 C 235 92, 245 76, 245 56', // лицо: от виска через подбородок к виску
    'M195 66 C 188 42, 201 20, 220 19 C 240 19, 253 36, 246 64', // причёска
    'M195 58 C 199 42, 212 34, 228 34 C 238 34, 244 41, 245 54' // линия лба, чёлка набок
];

const CENTER_DETAIL = [
    'M206 27 C 214 23, 226 22, 236 25', // прядь на макушке
    'M220 240 C 223 242, 223 248, 220 250 C 217 248, 217 242, 220 240' // пупок
];

// Хвост в своих координатах: резинка в (0, 0), волосы падают вниз-вправо
const PONY_MAIN = [
    'M-4 -3 C 0 -7, 7 -6, 9 -1 C 11 4, 5 8, 0 6 C -5 4, -7 0, -4 -3', // резинка
    'M7 3 C 24 8, 34 24, 35 46 C 36 66, 28 84, 15 96 C 21 76, 21 56, 13 38 C 9 26, 4 14, 0 6' // хвост
];

const PONY_DETAIL = [
    'M10 12 C 20 26, 25 46, 22 70',
    'M6 16 C 12 28, 15 42, 15 56'
];

const ARM = {
    upperMain: [
        'M6 9 C 28 15, 58 13, 84 9', // снаружи
        'M22 -9 C 44 -11, 66 -9, 84 -8' // изнутри
    ],
    upperDetail: [
        'M10 11 C 20 15, 30 15, 38 13' // плечо
    ],
    foreMain: [
        'M0 8 C 20 9, 44 7, 66 5', // предплечье снаружи
        'M0 -8 C 20 -8, 44 -6, 66 -5', // предплечье изнутри
        'M66 -6 C 74 -9, 82 -6, 82 0 C 82 6, 74 9, 66 6', // кулак
        'M80 -4 L103 -4 C 108 -4, 108 4, 103 4 L80 4' // ручка скакалки
    ],
    foreDetail: [
        'M89 -4 L89 4',
        'M96 -4 L96 4'
    ],
    watch: [
        'M50 -7 L50 7',
        'M56 -6 L56 6'
    ]
};

// Половина дуги скакалки: от кончика ручки (83, 310) через верх к центру
const ROPE = 'M83 310 C 64 236, 66 96, 116 34 C 146 -4, 184 -12, 220 -12';

const withDelays = (paths, start, step) => paths.map((d, index) => ({
    key: index,
    d,
    delay: `${(start + index * step).toFixed(2)}s`
}));

let instanceCounter = 0;

export default {
    name: 'HeroFitGirl',
    data() {
        instanceCounter += 1;

        return {
            ids: {
                glow: `fit-glow-${instanceCounter}`,
                spark: `fit-spark-${instanceCounter}`
            },
            sides: [
                { key: 'left', transform: null },
                { key: 'right', transform: 'matrix(-1 0 0 1 440 0)' }
            ],
            // Три кольца: снаружи оранжевое, дальше синее и светлое
            rings: [
                { key: 1, r: 206, to: 0.08, lag: '0s', delay: '0s' },
                { key: 2, r: 196, to: 0.3, lag: '0.6s', delay: '0.12s' },
                { key: 3, r: 186, to: 0.5, lag: '1.2s', delay: '0.24s' }
            ],
            body: {
                main: withDelays(BODY_MAIN, 0.35, 0.08),
                detail: withDelays(BODY_DETAIL, 1.2, 0.03),
                sparks: SPARK_LINES.map((index, order) => ({
                    key: index,
                    d: BODY_MAIN[index],
                    delay: `${(order * 0.7).toFixed(1)}s`
                }))
            },
            center: {
                main: withDelays(CENTER_MAIN, 0.15, 0.4),
                detail: withDelays(CENTER_DETAIL, 1.3, 0.1)
            },
            pony: {
                main: withDelays(PONY_MAIN, 0.6, 0.15),
                detail: withDelays(PONY_DETAIL, 1.4, 0.08)
            },
            arm: {
                upperMain: withDelays(ARM.upperMain, 0.9, 0.08),
                upperDetail: withDelays(ARM.upperDetail, 1.45, 0),
                foreMain: withDelays(ARM.foreMain, 1.05, 0.08),
                foreDetail: withDelays(ARM.foreDetail, 1.55, 0.04),
                watch: withDelays(ARM.watch, 1.6, 0.05)
            },
            rope: ROPE,
            floor: 'M44 562 L92 562 L100 553 L110 570 L122 534 L134 576 L144 558 L152 562 L396 562',
            dust: ['M164 548 L152 543', 'M162 555 L148 556', 'M168 541 L160 532'],
            heartPath: 'M0 3 C 0 -1, 5 -2, 6 2 C 7 5, 4 8, 0 11 C -4 8, -7 5, -6 2 C -5 -2, 0 -1, 0 3 Z',
            hearts: [
                { key: 0, x: 88, y: 230, s: 1, delay: '0s' },
                { key: 1, x: 356, y: 190, s: 0.8, delay: '1.2s' },
                { key: 2, x: 110, y: 400, s: 0.7, delay: '2.4s' },
                { key: 3, x: 338, y: 410, s: 1.1, delay: '0.6s' },
                { key: 4, x: 300, y: 100, s: 0.75, delay: '1.8s' }
            ]
        };
    }
};
</script>

<style scoped>
.fit {
    --fit-line: #f8500a;
    --fit-detail: rgba(248, 80, 10, 0.5);
    --fit-ring: rgba(15, 20, 39, 0.1);
    --fit-floor: rgba(55, 96, 231, 0.45);
    --fit-spark: #ffb547;
    --fit-blue: #3760e7;
    --fit-peach: #ffb48a;
    position: relative;
    display: flex;
    justify-content: center;
    width: 100%;
}

body.dark-theme .fit {
    --fit-detail: rgba(255, 138, 76, 0.55);
    --fit-ring: rgba(255, 255, 255, 0.1);
    --fit-floor: rgba(124, 155, 255, 0.55);
    --fit-blue: #7c9bff;
}

.fit-svg {
    width: 100%;
    max-width: 440px;
    height: auto;
    overflow: visible;
}

/* ---------- статичное состояние: всё «не нарисовано» ---------- */

.glow,
.spark,
.floor-pulse,
.heart,
.dust,
.rope,
.shadow {
    opacity: 0;
}

.ln {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
}

.ln--main {
    stroke: var(--fit-line);
    stroke-width: 2.4;
}

.ln--detail {
    stroke: var(--fit-detail);
    stroke-width: 1.5;
}

.watch {
    stroke: var(--fit-blue);
    stroke-width: 2.6;
}

.track {
    stroke: var(--fit-ring);
    stroke-width: 1.2;
}

/* Кольцо активности: дуга от верхней точки по часовой */
.act {
    opacity: 0;
    fill: none;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    transform: rotate(-90deg);
    transform-origin: 220px 292px;
}

.act--1 {
    stroke: var(--fit-line);
}

.act--2 {
    stroke: var(--fit-blue);
}

.act--3 {
    stroke: var(--fit-peach);
}

.floor {
    stroke: var(--fit-floor);
    stroke-width: 2;
}

.floor-pulse {
    fill: none;
    stroke: #3760e7;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: 0.12 0.88;
    stroke-dashoffset: 1;
}

.shadow {
    fill: var(--fit-line);
    fill-opacity: 0.1;
    transform-origin: 220px 560px;
}

.dust {
    stroke: var(--fit-detail);
    stroke-width: 2;
    stroke-linecap: round;
    transform-box: fill-box;
    transform-origin: 100% 50%;
}

.spark {
    fill: none;
    stroke: var(--fit-spark);
    stroke-width: 3.2;
    stroke-linecap: round;
    stroke-dasharray: 0.07 0.93;
    stroke-dashoffset: 1;
}

.heart {
    fill: var(--fit-line);
}

/* Скакалка сжимается по вертикали вокруг линии кистей. Толщина при этом
   не должна сплющиваться — отсюда non-scaling-stroke */
.rope {
    fill: none;
    stroke: var(--fit-line);
    stroke-width: 2;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
    transform-origin: 220px 310px;
}

.rope--ghost-1 {
    --lag: 0.05s;
    --ghost-opacity: 0.3;
}

.rope--ghost-2 {
    --lag: 0.1s;
    --ghost-opacity: 0.14;
}

.hop {
    transform-origin: 220px 556px;
}

/* ---------- суставы: руки держат ручки у бёдер ---------- */

.arm-upper {
    transform: translate(164px, 142px) rotate(100deg);
}

.arm-fore {
    transform: translate(84px, 0px) rotate(28deg);
}

.pony {
    transform: translate(238px, 22px) rotate(0deg);
}

/* ---------- анимации: стартуют, когда <Reveal> проявил блок ---------- */

[data-sr-revealed="true"] .glow {
    animation: glow-in 1.6s ease-out forwards;
}

[data-sr-revealed="true"] .ln {
    animation: line-draw 1.2s cubic-bezier(0.65, 0, 0.35, 1) forwards;
    animation-delay: var(--d, 0s);
}

[data-sr-revealed="true"] .act {
    animation: act-fill 9.6s ease-in-out infinite;
    animation-delay: calc(2.4s + var(--a, 0s));
}

[data-sr-revealed="true"] .spark {
    animation: spark-run 2.8s linear infinite;
    animation-delay: calc(2.6s + var(--s, 0s));
}

[data-sr-revealed="true"] .floor-pulse {
    animation: spark-run 2.4s linear 2.8s infinite;
}

[data-sr-revealed="true"] .heart {
    animation: heart-rise 5.5s ease-in-out infinite;
    animation-delay: calc(2s + var(--m, 0s));
}

/* Прыжок: 1.2 с на оборот скакалки; она проходит под ногами на середине */
[data-sr-revealed="true"] .hop {
    animation: hop 1.2s linear 2.4s infinite;
}

[data-sr-revealed="true"] .shadow {
    animation:
        fade-in 0.6s ease-out 1.8s forwards,
        shadow-hop 1.2s linear 2.4s infinite;
}

[data-sr-revealed="true"] .dust {
    animation: dust 1.2s ease-out 2.4s infinite;
}

[data-sr-revealed="true"] .rope {
    animation:
        rope-in 0.6s ease-out 1.8s forwards,
        rope-spin 1.2s 2.4s infinite;
}

[data-sr-revealed="true"] .rope--ghost-1,
[data-sr-revealed="true"] .rope--ghost-2 {
    animation:
        ghost-in 0.4s ease-out 2.6s forwards,
        rope-spin 1.2s calc(2.4s + var(--lag)) infinite;
}

[data-sr-revealed="true"] .pony {
    animation: pony-swing 1.2s ease-in-out 2.4s infinite;
}

@keyframes line-draw {
    to {
        stroke-dashoffset: 0;
    }
}

@keyframes fade-in {
    to {
        opacity: 1;
    }
}

@keyframes rope-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes ghost-in {
    from {
        opacity: 0;
    }

    to {
        opacity: var(--ghost-opacity);
    }
}

@keyframes glow-in {
    from {
        opacity: 0;
        transform: scale(0.85);
    }

    to {
        opacity: 1;
        transform: none;
    }
}

/*
  Если смотреть спереди, вращение скакалки — это косинус: дуга медленно
  разворачивается вверху и внизу и быстро проскакивает линию кистей.
  Внизу дуга чуть короче — ровно до пола под подошвами
*/
@keyframes rope-spin {
    0% {
        transform: scaleY(1);
        animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0);
    }

    25% {
        transform: scaleY(0);
        animation-timing-function: cubic-bezier(0.61, 1, 0.88, 1);
    }

    50% {
        transform: scaleY(-0.783);
        animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0);
    }

    75% {
        transform: scaleY(0);
        animation-timing-function: cubic-bezier(0.61, 1, 0.88, 1);
    }

    100% {
        transform: scaleY(1);
    }
}

/* Отрыв, зависание в верхней точке, приземление с лёгким пружинящим «присестом» */
@keyframes hop {

    0%,
    28% {
        transform: translateY(0) scale(1, 1);
        animation-timing-function: cubic-bezier(0.2, 0.7, 0.4, 1);
    }

    50% {
        transform: translateY(-20px) scale(1, 1);
        animation-timing-function: cubic-bezier(0.6, 0, 0.8, 0.4);
    }

    72% {
        transform: translateY(0) scale(1, 1);
        animation-timing-function: ease-out;
    }

    80% {
        transform: translateY(0) scale(1.012, 0.982);
        animation-timing-function: ease-in-out;
    }

    92%,
    100% {
        transform: translateY(0) scale(1, 1);
    }
}

@keyframes shadow-hop {

    0%,
    28% {
        transform: scale(1);
    }

    50% {
        transform: scale(0.72);
    }

    72%,
    100% {
        transform: scale(1);
    }
}

@keyframes dust {

    0%,
    70% {
        opacity: 0;
        transform: scale(0.4);
    }

    78% {
        opacity: 1;
        transform: scale(1);
    }

    94%,
    100% {
        opacity: 0;
        transform: scale(1.3);
    }
}

/* Хвост отстаёт от тела: при взлёте висит, наверху подлетает, на приземлении хлёстко падает */
@keyframes pony-swing {
    0% {
        transform: translate(238px, 22px) rotate(0deg);
    }

    35% {
        transform: translate(238px, 22px) rotate(7deg);
    }

    55% {
        transform: translate(238px, 22px) rotate(-14deg);
    }

    76% {
        transform: translate(238px, 22px) rotate(9deg);
    }

    90% {
        transform: translate(238px, 22px) rotate(-3deg);
    }

    100% {
        transform: translate(238px, 22px) rotate(0deg);
    }
}

@keyframes act-fill {
    0% {
        stroke-dashoffset: 1;
        opacity: 0;
    }

    4% {
        opacity: 1;
    }

    78% {
        stroke-dashoffset: var(--to);
        opacity: 1;
    }

    92% {
        stroke-dashoffset: var(--to);
        opacity: 0;
    }

    100% {
        stroke-dashoffset: 1;
        opacity: 0;
    }
}

/* Искра пробегает контур от начала до конца, появляясь и гаснув по краям */
@keyframes spark-run {
    0% {
        stroke-dashoffset: 1;
        opacity: 0;
    }

    10%,
    80% {
        opacity: 1;
    }

    100% {
        stroke-dashoffset: 0;
        opacity: 0;
    }
}

@keyframes heart-rise {
    0% {
        opacity: 0;
        transform: translateY(0) scale(0.6);
    }

    25% {
        opacity: 0.8;
        transform: translateY(-10px) scale(1);
    }

    100% {
        opacity: 0;
        transform: translateY(-46px) scale(0.9);
    }
}

@media (max-width: 640px) {
    .fit-svg {
        max-width: 340px;
    }
}

/* Без анимаций — сразу итоговая картинка: скакалка над головой */
@media (prefers-reduced-motion: reduce) {
    .ln {
        stroke-dashoffset: 0;
        animation: none !important;
    }

    .glow,
    .rope,
    .shadow {
        opacity: 1;
        animation: none !important;
    }

    .act {
        opacity: 1;
        stroke-dashoffset: 0.4;
        animation: none !important;
    }

    .spark,
    .floor-pulse,
    .heart,
    .dust,
    .hop,
    .pony,
    .rope--ghost-1,
    .rope--ghost-2 {
        animation: none !important;
    }

    .rope--ghost-1,
    .rope--ghost-2 {
        display: none;
    }
}
</style>
