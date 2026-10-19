<template>
    <!-- Иллюстрация: бодибилдер из одних линий приседает со штангой. Скринридеру тут читать нечего -->
    <div class="athlete" aria-hidden="true">
        <svg class="athlete-svg" viewBox="0 -40 440 620" fill="none">
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

            <!-- Циферблат секундомера: свечение, кольцо, деления -->
            <circle class="glow" cx="220" cy="292" r="200" :fill="`url(#${ids.glow})`" />
            <circle class="ln ring" pathLength="1" cx="220" cy="292" r="206" style="--d: 0s" />
            <g class="ticks">
                <line v-for="tick in ticks" :key="tick.key" :class="['tick', { 'tick--major': tick.major }]"
                    :x1="tick.x1" :y1="tick.y1" :x2="tick.x2" :y2="tick.y2" :style="{ '--t': tick.delay }" />
            </g>
            <!-- Счётчик: кольцо прибавляет деление за каждое повторение -->
            <circle class="rep-ring" pathLength="1" cx="220" cy="292" r="214" />

            <!-- Пол — линия пульса -->
            <path class="ln floor" pathLength="1" :d="floor" style="--d: 1.6s" />
            <path class="floor-pulse" pathLength="1" :d="floor" />

            <!-- Левая половина тела и её зеркало -->
            <g v-for="side in sides" :key="side.key" :transform="side.transform">
                <!-- Ноги: стопа стоит, голень наклоняется вокруг щиколотки,
                     бедро поворачивается в тазобедренном суставе -->
                <path class="ln ln--main" pathLength="1" :d="legs.foot.d" :style="{ '--d': legs.foot.delay }" />
                <g class="shin">
                    <path v-for="line in legs.shin" :key="`shin-${line.key}`" :class="['ln', `ln--${line.kind}`]"
                        pathLength="1" :d="line.d" :style="{ '--d': line.delay }" />
                    <path class="spark" pathLength="1" :d="legs.shin[0].d" :filter="`url(#${ids.spark})`"
                        style="--s: 1.4s" />
                </g>
                <g class="thigh">
                    <path v-for="line in legs.thigh" :key="`thigh-${line.key}`" :class="['ln', `ln--${line.kind}`]"
                        pathLength="1" :d="line.d" :style="{ '--d': line.delay }" />
                </g>

                <!-- Шлейф: две полупрозрачные копии блинов отстают от движения -->
                <g v-for="ghost in ghosts" :key="`ghost-${ghost}`" :class="['upper', 'plate-ghost', `plate-ghost--${ghost}`]">
                    <path v-for="line in barbell.plates" :key="`ghost-plate-${line.key}`" class="ln--ghost" :d="line.d" />
                </g>

                <!-- Корпус, руки и штанга опускаются вместе -->
                <g class="upper">
                    <path v-for="line in body.main" :key="`main-${line.key}`" class="ln ln--main" pathLength="1"
                        :d="line.d" :style="{ '--d': line.delay }" />
                    <path v-for="line in body.detail" :key="`detail-${line.key}`" class="ln ln--detail"
                        pathLength="1" :d="line.d" :style="{ '--d': line.delay }" />
                    <path v-for="line in body.sparks" :key="`spark-${line.key}`" class="spark" pathLength="1"
                        :d="line.d" :filter="`url(#${ids.spark})`" :style="{ '--s': line.delay }" />
                    <path v-for="(d, index) in effort" :key="`effort-${index}`" class="effort" :d="d" />

                    <!-- Рука буквой V: локоть внизу, предплечье поднимается к кулаку на грифе -->
                    <path v-for="line in arm.main" :key="`arm-${line.key}`" class="ln ln--main" pathLength="1"
                        :d="line.d" :style="{ '--d': line.delay }" />
                    <path v-for="line in arm.detail" :key="`arm-detail-${line.key}`" class="ln ln--detail"
                        pathLength="1" :d="line.d" :style="{ '--d': line.delay }" />
                    <g class="fist">
                        <path class="ln ln--main" pathLength="1" :d="arm.fist" style="--d: 1.28s" />
                        <path v-for="line in arm.knuckles" :key="`knuckle-${line.key}`" class="ln ln--detail"
                            pathLength="1" :d="line.d" :style="{ '--d': line.delay }" />
                    </g>

                    <!-- Гриф лежит на трапециях: за шеей его не видно, кулак его закрывает -->
                    <path v-for="line in barbell.bar" :key="`bar-${line.key}`" class="ln ln--main" pathLength="1"
                        :d="line.d" :style="{ '--d': line.delay }" />
                    <g class="whip">
                        <path v-for="line in barbell.plates" :key="`plate-${line.key}`"
                            :class="['ln', `ln--${line.kind}`]" pathLength="1" :d="line.d"
                            :style="{ '--d': line.delay }" />
                    </g>
                </g>
            </g>

            <!-- Центр: голова, пояс, грудина, пресс -->
            <g class="upper">
                <path v-for="line in center.main" :key="`center-${line.key}`" class="ln ln--main" pathLength="1"
                    :d="line.d" :style="{ '--d': line.delay }" />
                <path v-for="line in center.detail" :key="`center-detail-${line.key}`" class="ln ln--detail"
                    pathLength="1" :d="line.d" :style="{ '--d': line.delay }" />
            </g>

            <circle v-for="mote in motes" :key="mote.key" class="mote" :cx="mote.x" :cy="mote.y" :r="mote.r"
                :style="{ '--m': mote.delay }" />
        </svg>
    </div>
</template>

<script>
/*
  Контуры нарисованы для левой половины фигуры (центр — x = 220), правая —
  её зеркало. Присед собран из трёх частей:
    .upper — корпус с руками и штангой опускается и чуть «укорачивается»
             (в анфас так выглядит наклон вперёд);
    .thigh — бедро поворачивается наружу вокруг таза (178, 326) и укорачивается:
             в нижней точке оно смотрит на зрителя;
    .shin  — голень наклоняется вокруг щиколотки, стопа стоит на месте.
  Кадры движения рассчитаны заранее (плавность «запечена» в них), так что колено
  бедра и колено голени сходятся в каждый момент — расхождение меньше 0,4px.
*/
const BODY_MAIN = [
    'M206 96 C 202 108, 180 116, 160 121', // трапеция
    'M160 121 C 140 116, 125 127, 122 144 C 121 150, 122 155, 125 160', // дельта
    'M219 204 C 204 212, 182 208, 170 194 C 166 188, 164 180, 166 172', // грудь
    'M166 172 C 154 198, 156 232, 168 258 C 175 274, 180 286, 182 298', // широчайшая
    'M182 298 C 180 308, 179 316, 178 326', // таз
    'M178 326 C 194 334, 208 344, 220 352' // плавки
];

const BODY_DETAIL = [
    'M194 57 C 188 58, 188 70, 195 71', // ухо
    'M210 98 C 212 108, 215 116, 218 122', // шея
    'M216 126 C 200 128, 180 126, 164 128', // ключица
    'M174 214 L186 208', // зубчатая мышца
    'M176 229 L188 223',
    'M179 244 L189 239',
    'M201 210 C 196 238, 196 270, 204 302', // край пресса
    'M201 234 C 207 236, 214 236, 220 234', // кубики
    'M199 258 C 206 260, 214 260, 220 258',
    'M201 282 C 208 284, 214 284, 220 282',
    'M188 288 C 196 302, 206 318, 214 332' // косые
];

// По трапеции и широчайшей пробегает искра
const SPARK_LINES = [0, 3];

// Стойка для приседа — шире, чем в позинге: ноги разведены наружу
const LEGS = {
    thigh: [
        ['main', 'M178 326 C 155.1 352, 142.6 392, 146.8 426 C 148.2 440, 152.1 450, 156.4 456'], // бедро снаружи
        ['main', 'M210.6 356 C 208.3 386, 198.7 418, 186.5 446'], // бедро изнутри
        ['detail', 'M181.3 350 C 175.9 380, 175.8 408, 179.3 430'] // разделение квадрицепса
    ],
    shin: [
        ['main', 'M156.7 462 C 138.1 486, 136.7 516, 148 540'], // икра снаружи
        ['main', 'M184 460 C 194.7 480, 187.1 512, 170 540'], // икра изнутри
        ['detail', 'M160.2 458 C 167.5 464, 176.5 464, 183.2 458'], // колено
        ['detail', 'M169.6 472 C 169.2 494, 166.9 514, 162.1 530'] // голень
    ],
    foot: 'M148 540 C 140 549, 144.2 556, 161.2 556 C 173.2 556, 178 549, 170 540'
};

const CENTER_MAIN = [
    'M220 28 C 237 28, 247 42, 247 61 C 247 79, 238 94, 220 96 C 202 94, 193 79, 193 61 C 193 42, 203 28, 220 28', // голова
    'M182 300 C 204 307, 236 307, 258 300' // пояс плавок
];

const CENTER_DETAIL = [
    'M220 132 L220 200', // грудина
    'M220 210 L220 300' // белая линия пресса
];

// Рука буквой V: снаружи — предплечье, локоть и низ плеча до подмышки,
// внутри — предплечье до сгиба и верх плеча до дельты
const ARM = {
    main: [
        'M78.3 125.3 C 69 147, 67 178, 75 200 C 80 212, 91 216, 102 211 C 124 202, 147 190, 164 176',
        'M103.2 126.7 C 106 143, 105 162, 100 178 C 108 172, 117 166, 125 160'
    ],
    detail: [
        'M90 136 C 85 155, 85 174, 89 192', // мышцы предплечья
        'M112 196 C 126 189, 140 182, 152 174', // бицепс и трицепс
        'M91 199 C 95 204, 100 205, 106 202' // сгиб локтя
    ],
    // Кулак описан вдоль оси предплечья — CSS ставит его на гриф
    fist: 'M70 -13 C 81 -19, 95 -12, 95 0 C 95 12, 82 17, 70 12',
    knuckles: ['M85 -8 L92 -7', 'M86 0 L94 0', 'M85 8 L92 7']
};

// Гриф толщиной 6 на уровне y = 112: от замка до кулака и от кулака до трапеции
const BAR = [
    'M64 109 L78.3 109',
    'M64 115 L76.6 115',
    'M104.5 109 L193 109',
    'M105.7 115 L180 115'
];

// Блины видны ребром: замок, малый блин, большой блин, втулка
const PLATES = [
    ['main', 'M60 103 L62 103 Q64 103 64 105 L64 119 Q64 121 62 121 L60 121 Q58 121 58 119 L58 105 Q58 103 60 103 Z'],
    ['main', 'M53 80 L55 80 Q58 80 58 83 L58 141 Q58 144 55 144 L53 144 Q50 144 50 141 L50 83 Q50 80 53 80 Z'],
    ['main', 'M41 54 L45 54 Q50 54 50 59 L50 165 Q50 170 45 170 L41 170 Q36 170 36 165 L36 59 Q36 54 41 54 Z'],
    ['main', 'M36 107 L26 107 Q22 107 22 112 Q22 117 26 117 L36 117'],
    ['detail', 'M43 64 L43 160']
];

// Штрихи усилия у головы — вспыхивают, когда атлет встаёт из нижней точки
const EFFORT = ['M184 40 L174 34', 'M181 56 L169 54', 'M183 72 L173 77'];

const withDelays = (paths, start, step) => paths.map((d, index) => ({
    key: index,
    d,
    delay: `${(start + index * step).toFixed(2)}s`
}));

const withKinds = (lines, start, step) => lines.map(([kind, d], index) => ({
    key: index,
    kind,
    d,
    delay: `${(start + index * step).toFixed(2)}s`
}));

let instanceCounter = 0;

export default {
    name: 'HeroAthlete',
    data() {
        instanceCounter += 1;

        // 60 делений секундомера, каждое пятое длиннее
        const ticks = Array.from({ length: 60 }, (_, index) => {
            const angle = (index * 6 - 90) * Math.PI / 180;
            const major = index % 5 === 0;
            const inner = major ? 186 : 194;
            const outer = 202;
            const point = (radius) => [
                Math.round((220 + radius * Math.cos(angle)) * 10) / 10,
                Math.round((292 + radius * Math.sin(angle)) * 10) / 10
            ];
            const [x1, y1] = point(inner);
            const [x2, y2] = point(outer);
            return { key: index, major, x1, y1, x2, y2, delay: `${(0.2 + index * 0.018).toFixed(3)}s` };
        });

        return {
            ids: {
                glow: `athlete-glow-${instanceCounter}`,
                spark: `athlete-spark-${instanceCounter}`
            },
            ticks,
            ghosts: [1, 2],
            sides: [
                { key: 'left', transform: null },
                { key: 'right', transform: 'matrix(-1 0 0 1 440 0)' }
            ],
            body: {
                main: withDelays(BODY_MAIN, 0.35, 0.07),
                detail: withDelays(BODY_DETAIL, 1.25, 0.03),
                sparks: SPARK_LINES.map((index, order) => ({
                    key: index,
                    d: BODY_MAIN[index],
                    delay: `${(order * 0.7).toFixed(1)}s`
                }))
            },
            legs: {
                thigh: withKinds(LEGS.thigh, 0.77, 0.07),
                shin: withKinds(LEGS.shin, 0.91, 0.07),
                foot: { d: LEGS.foot, delay: '1.12s' }
            },
            center: {
                main: withDelays(CENTER_MAIN, 0.15, 0.5),
                detail: withDelays(CENTER_DETAIL, 1.2, 0.06)
            },
            arm: {
                main: withDelays(ARM.main, 1, 0.1),
                detail: withDelays(ARM.detail, 1.5, 0.04),
                fist: ARM.fist,
                knuckles: withDelays(ARM.knuckles, 1.55, 0.03)
            },
            barbell: {
                bar: withDelays(BAR, 1.3, 0.05),
                plates: withKinds(PLATES, 1.45, 0.06)
            },
            effort: EFFORT,
            floor: 'M44 562 L292 562 L300 553 L308 570 L318 534 L330 576 L340 558 L348 562 L396 562',
            motes: [
                { key: 0, x: 92, y: 236, r: 2.6, delay: '0s' },
                { key: 1, x: 352, y: 196, r: 2.2, delay: '1.1s' },
                { key: 2, x: 112, y: 398, r: 2, delay: '2.3s' },
                { key: 3, x: 338, y: 420, r: 2.8, delay: '0.6s' },
                { key: 4, x: 296, y: 108, r: 2, delay: '1.8s' },
                { key: 5, x: 150, y: 88, r: 2.4, delay: '2.9s' }
            ]
        };
    }
};
</script>

<style scoped>
.athlete {
    --athlete-line: #f8500a;
    --athlete-detail: rgba(248, 80, 10, 0.5);
    --athlete-ring: rgba(15, 20, 39, 0.1);
    --athlete-tick: rgba(15, 20, 39, 0.2);
    --athlete-tick-major: rgba(248, 80, 10, 0.6);
    --athlete-floor: rgba(55, 96, 231, 0.45);
    --athlete-spark: #ffb547;
    position: relative;
    display: flex;
    justify-content: center;
    width: 100%;
}

body.dark-theme .athlete {
    --athlete-detail: rgba(255, 138, 76, 0.55);
    --athlete-ring: rgba(255, 255, 255, 0.1);
    --athlete-tick: rgba(255, 255, 255, 0.2);
    --athlete-floor: rgba(124, 155, 255, 0.55);
}

.athlete-svg {
    width: 100%;
    max-width: 440px;
    height: auto;
    overflow: visible;
}

/* ---------- статичное состояние: всё «не нарисовано» ---------- */

.glow,
.tick,
.spark,
.floor-pulse,
.effort,
.mote {
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
    stroke: var(--athlete-line);
    stroke-width: 2.4;
}

.ln--detail {
    stroke: var(--athlete-detail);
    stroke-width: 1.5;
}

.ring {
    stroke: var(--athlete-ring);
    stroke-width: 1.2;
}

.ticks,
.rep-ring {
    transform-origin: 220px 292px;
}

.tick {
    stroke: var(--athlete-tick);
    stroke-width: 1.2;
    stroke-linecap: round;
}

.tick--major {
    stroke: var(--athlete-tick-major);
    stroke-width: 2;
}

.rep-ring {
    fill: none;
    stroke: var(--athlete-line);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    transform: rotate(-90deg);
}

.floor {
    stroke: var(--athlete-floor);
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

.spark {
    fill: none;
    stroke: var(--athlete-spark);
    stroke-width: 3.2;
    stroke-linecap: round;
    stroke-dasharray: 0.07 0.93;
    stroke-dashoffset: 1;
}

.effort {
    stroke: var(--athlete-line);
    stroke-width: 2.4;
    stroke-linecap: round;
    transform-box: fill-box;
    transform-origin: right center;
}

.mote {
    fill: var(--athlete-line);
}

.glow {
    transform-box: fill-box;
    transform-origin: center;
}

/* ---------- суставы ---------- */

/* Корпус «укорачивается» от линии таза — так в анфас выглядит наклон вперёд */
.upper {
    transform-origin: 220px 326px;
}

/* Кулак на грифе: ось предплечья смотрит вверх, центр кулака в (92, 112) */
.fist {
    transform: translate(87.27px, 195.87px) rotate(273.24deg);
}

/* Концы грифа пружинят вокруг кулака */
.whip {
    transform-origin: 92px 112px;
}

/* Шлейф блинов: копии без прорисовки, отстают на --lag */
.ln--ghost {
    fill: none;
    stroke: var(--athlete-line);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.plate-ghost {
    opacity: 0;
}

.plate-ghost--1 {
    --lag: 0.08s;
    --ghost-opacity: 0.3;
}

.plate-ghost--2 {
    --lag: 0.16s;
    --ghost-opacity: 0.14;
}

/* ---------- анимации: стартуют, когда <Reveal> проявил блок ---------- */

[data-sr-revealed="true"] .glow {
    animation: glow-in 1.6s ease-out forwards;
}

[data-sr-revealed="true"] .ln {
    animation: line-draw 1.2s cubic-bezier(0.65, 0, 0.35, 1) forwards;
    animation-delay: var(--d, 0s);
}

[data-sr-revealed="true"] .tick {
    animation: fade-in 0.4s ease-out forwards;
    animation-delay: var(--t, 0s);
}

[data-sr-revealed="true"] .ticks {
    animation: spin 90s linear 2.4s infinite;
}

[data-sr-revealed="true"] .spark {
    animation: spark-run 2.8s linear infinite;
    animation-delay: calc(2.6s + var(--s, 0s));
}

[data-sr-revealed="true"] .floor-pulse {
    animation: spark-run 2.4s linear 2.8s infinite;
}

[data-sr-revealed="true"] .mote {
    animation: mote-rise 5.5s ease-in-out infinite;
    animation-delay: calc(2s + var(--m, 0s));
}

/* Присед за 3.6 с: стойка → вниз → пауза → вверх → стойка */
[data-sr-revealed="true"] .upper {
    animation: squat-upper 3.6s linear 2.4s infinite;
}

[data-sr-revealed="true"] .thigh {
    animation: squat-thigh 3.6s linear 2.4s infinite;
}

[data-sr-revealed="true"] .shin {
    animation: squat-shin 3.6s linear 2.4s infinite;
}

[data-sr-revealed="true"] .plate-ghost {
    animation:
        ghost-in 0.6s ease-out 2.2s forwards,
        squat-upper 3.6s linear calc(2.4s + var(--lag, 0s)) infinite;
}

[data-sr-revealed="true"] .whip {
    animation: bar-whip 3.6s ease-in-out 2.4s infinite;
}

[data-sr-revealed="true"] .effort {
    animation: effort-flash 3.6s ease-out 2.4s infinite;
}

/* Деление прибавляется в момент, когда атлет выпрямился (84 % повторения) */
[data-sr-revealed="true"] .rep-ring {
    animation: rep-fill 46.8s steps(13, jump-none) 1.82s infinite;
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

@keyframes ghost-in {
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

@keyframes spin {
    to {
        transform: rotate(360deg);
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

@keyframes mote-rise {
    0% {
        opacity: 0;
        transform: translateY(0);
    }

    25% {
        opacity: 0.75;
    }

    100% {
        opacity: 0;
        transform: translateY(-46px);
    }
}

/* Кадры приседа рассчитаны заранее — между ними linear */
@keyframes squat-upper {

    0%,
    12% {
        transform: translateY(0px) scaleY(1);
    }

    17% {
        transform: translateY(3.4px) scaleY(0.997);
    }

    22% {
        transform: translateY(13.2px) scaleY(0.988);
    }

    27% {
        transform: translateY(27.8px) scaleY(0.975);
    }

    32% {
        transform: translateY(45px) scaleY(0.96);
    }

    37% {
        transform: translateY(62.2px) scaleY(0.945);
    }

    42% {
        transform: translateY(76.8px) scaleY(0.932);
    }

    47% {
        transform: translateY(86.6px) scaleY(0.923);
    }

    52%,
    58% {
        transform: translateY(90px) scaleY(0.92);
    }

    62.33% {
        transform: translateY(84px) scaleY(0.925);
    }

    66.67% {
        transform: translateY(67.5px) scaleY(0.94);
    }

    71% {
        transform: translateY(45px) scaleY(0.96);
    }

    75.33% {
        transform: translateY(22.5px) scaleY(0.98);
    }

    79.67% {
        transform: translateY(6px) scaleY(0.995);
    }

    84%,
    100% {
        transform: translateY(0px) scaleY(1);
    }
}

@keyframes squat-thigh {

    0%,
    12% {
        transform: translate(178px, 326px) rotate(0deg) scaleY(1) translate(-178px, -326px);
    }

    17% {
        transform: translate(178px, 329.4px) rotate(0.35deg) scaleY(0.979) translate(-178px, -326px);
    }

    22% {
        transform: translate(178px, 339.2px) rotate(1.45deg) scaleY(0.918) translate(-178px, -326px);
    }

    27% {
        transform: translate(178px, 353.8px) rotate(3.39deg) scaleY(0.828) translate(-178px, -326px);
    }

    32% {
        transform: translate(178px, 371px) rotate(6.29deg) scaleY(0.725) translate(-178px, -326px);
    }

    37% {
        transform: translate(178px, 388.2px) rotate(10.17deg) scaleY(0.624) translate(-178px, -326px);
    }

    42% {
        transform: translate(178px, 402.8px) rotate(14.57deg) scaleY(0.543) translate(-178px, -326px);
    }

    47% {
        transform: translate(178px, 412.6px) rotate(18.33deg) scaleY(0.492) translate(-178px, -326px);
    }

    52%,
    58% {
        transform: translate(178px, 416px) rotate(19.85deg) scaleY(0.475) translate(-178px, -326px);
    }

    62.33% {
        transform: translate(178px, 410px) rotate(17.25deg) scaleY(0.505) translate(-178px, -326px);
    }

    66.67% {
        transform: translate(178px, 393.5px) rotate(11.62deg) scaleY(0.594) translate(-178px, -326px);
    }

    71% {
        transform: translate(178px, 371px) rotate(6.29deg) scaleY(0.725) translate(-178px, -326px);
    }

    75.33% {
        transform: translate(178px, 348.5px) rotate(2.64deg) scaleY(0.861) translate(-178px, -326px);
    }

    79.67% {
        transform: translate(178px, 332px) rotate(0.63deg) scaleY(0.962) translate(-178px, -326px);
    }

    84%,
    100% {
        transform: translate(178px, 326px) rotate(0deg) scaleY(1) translate(-178px, -326px);
    }
}

@keyframes squat-shin {

    0%,
    12% {
        transform: translate(159px, 540px) skewX(0deg) scaleY(1) translate(-159px, -540px);
    }

    17% {
        transform: translate(159px, 540px) skewX(0.59deg) scaleY(0.994) translate(-159px, -540px);
    }

    22% {
        transform: translate(159px, 540px) skewX(2.32deg) scaleY(0.976) translate(-159px, -540px);
    }

    27% {
        transform: translate(159px, 540px) skewX(5.02deg) scaleY(0.949) translate(-159px, -540px);
    }

    32% {
        transform: translate(159px, 540px) skewX(8.38deg) scaleY(0.918) translate(-159px, -540px);
    }

    37% {
        transform: translate(159px, 540px) skewX(11.91deg) scaleY(0.886) translate(-159px, -540px);
    }

    42% {
        transform: translate(159px, 540px) skewX(15.03deg) scaleY(0.86) translate(-159px, -540px);
    }

    47% {
        transform: translate(159px, 540px) skewX(17.17deg) scaleY(0.842) translate(-159px, -540px);
    }

    52%,
    58% {
        transform: translate(159px, 540px) skewX(17.93deg) scaleY(0.835) translate(-159px, -540px);
    }

    62.33% {
        transform: translate(159px, 540px) skewX(16.6deg) scaleY(0.846) translate(-159px, -540px);
    }

    66.67% {
        transform: translate(159px, 540px) skewX(13.03deg) scaleY(0.877) translate(-159px, -540px);
    }

    71% {
        transform: translate(159px, 540px) skewX(8.38deg) scaleY(0.918) translate(-159px, -540px);
    }

    75.33% {
        transform: translate(159px, 540px) skewX(4.03deg) scaleY(0.959) translate(-159px, -540px);
    }

    79.67% {
        transform: translate(159px, 540px) skewX(1.05deg) scaleY(0.989) translate(-159px, -540px);
    }

    84%,
    100% {
        transform: translate(159px, 540px) skewX(0deg) scaleY(1) translate(-159px, -540px);
    }
}

/*
  Гриф пружинит: на разгоне вниз концы отстают и приподнимаются, при торможении
  внизу проседают, на рывке вверх проседают сильнее всего, в стойке — отыгрывают
*/
@keyframes bar-whip {

    0%,
    12% {
        transform: rotate(0deg);
    }

    18% {
        transform: rotate(2.2deg);
    }

    30% {
        transform: rotate(0deg);
    }

    46% {
        transform: rotate(-2.6deg);
    }

    54% {
        transform: rotate(0.9deg);
    }

    60% {
        transform: rotate(-3deg);
    }

    70% {
        transform: rotate(0deg);
    }

    80% {
        transform: rotate(2deg);
    }

    88% {
        transform: rotate(-0.8deg);
    }

    94%,
    100% {
        transform: rotate(0deg);
    }
}

@keyframes effort-flash {

    0%,
    56% {
        opacity: 0;
        transform: scale(0.5);
    }

    62% {
        opacity: 1;
        transform: scale(1);
    }

    74% {
        opacity: 1;
        transform: scale(1);
    }

    84%,
    100% {
        opacity: 0;
        transform: translateX(-4px) scale(1.1);
    }
}

@keyframes rep-fill {
    from {
        stroke-dashoffset: 1;
    }

    to {
        stroke-dashoffset: 0;
    }
}

@media (max-width: 640px) {
    .athlete-svg {
        max-width: 340px;
    }
}

/* Без анимаций — сразу итоговая картинка: атлет стоит со штангой на плечах */
@media (prefers-reduced-motion: reduce) {
    .ln {
        stroke-dashoffset: 0;
        animation: none !important;
    }

    .glow,
    .tick {
        opacity: 1;
        animation: none !important;
    }

    .ticks,
    .spark,
    .floor-pulse,
    .effort,
    .mote,
    .rep-ring,
    .upper,
    .thigh,
    .shin,
    .whip {
        animation: none !important;
    }

    .rep-ring {
        stroke-dashoffset: 0.25;
    }

    .plate-ghost {
        display: none;
    }
}
</style>
