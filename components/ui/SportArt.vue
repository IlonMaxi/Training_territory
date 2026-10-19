<script>
/*
  Линейные иллюстрации на спортивную тему — свои, вместо чужих фотографий.
  Каждая прорисовывается, когда родительский <Reveal> проявил блок, а потом
  живёт негромкой анимацией. Холст у всех 200 × 200, цвета — из переменных:
    --art-line    основные контуры
    --art-detail  второстепенные штрихи
    --art-accent  акценты: галочки, пульс, искры
  Контейнер просто переопределяет переменные — и та же картинка работает
  на светлой плитке, оранжевой карточке и тёмной колонке.
*/

// ---------- конструкторы узлов ----------

// Рисуемые контуры: появляются прорисовкой — сначала основные, потом детали и акценты
const main = (d, extra) => ({ el: 'path', kind: 'main', d, ...extra });
const detail = (d, extra) => ({ el: 'path', kind: 'detail', d, ...extra });
const accent = (d, extra) => ({ el: 'path', kind: 'accent', d, ...extra });
const ring = (cx, cy, r, kind = 'main') => ({ el: 'circle', kind, cx, cy, r });
// Эффект: не прорисовывается, появляется и двигается по своему классу
const fx = (d, cls, extra) => ({ el: 'path', kind: 'fx', d, cls, ...extra });
const group = (cls, children, extra) => ({ el: 'g', cls, children, ...extra });
// Левая половина и её зеркало относительно вертикали x = 100
const symmetric = (children) => [...children, { el: 'g', mirror: true, children }];
// Копия для шлейфа: те же линии, только без прорисовки
const ghostOf = (nodes) => nodes.map((node) => (node.el === 'g'
    ? { ...node, children: ghostOf(node.children) }
    : { ...node, kind: 'fx', cls: 'sa-ghost-ln' }));

const round = (value) => Math.round(value * 10) / 10;

// Прямоугольник со скруглёнными углами
const rr = (x, y, w, h, r) => [
    `M${x + r} ${y} L${x + w - r} ${y} Q${x + w} ${y} ${x + w} ${y + r}`,
    `L${x + w} ${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h}`,
    `L${x + r} ${y + h} Q${x} ${y + h} ${x} ${y + h - r}`,
    `L${x} ${y + r} Q${x} ${y} ${x + r} ${y} Z`
].join(' ');

// ---------- секундомер: распорядок дня ----------

const STOPWATCH = {
    nodes: [
        ...[98, 116, 134].map((y, index) => fx(`M${index === 1 ? 8 : 16} ${y} L32 ${y}`, 'sa-speed', {
            style: { '--i': index }
        })),
        ring(100, 116, 58),
        main(rr(81, 32, 38, 12, 6)),
        main('M94 44 L94 58 M106 44 L106 58'),
        main('M141 75 L147.4 68.6 M143.2 64.4 L151.6 72.8'),
        main('M59 75 L52.6 68.6 M56.8 64.4 L48.4 72.8'),
        ring(100, 116, 49, 'detail'),
        // 12 делений, каждое третье длиннее
        ...Array.from({ length: 12 }, (_, index) => {
            const angle = (index * 30 - 90) * Math.PI / 180;
            const point = (radius) => `${round(100 + radius * Math.cos(angle))} ${round(116 + radius * Math.sin(angle))}`;
            return detail(`M${point(index % 3 === 0 ? 38 : 41)} L${point(45)}`);
        }),
        // Дуга «прошедшего времени» бежит за стрелкой
        { el: 'circle', kind: 'fx', cls: 'sa-sweep', cx: 100, cy: 116, r: 53.5, measured: true },
        group('sa-hand', [main('M100 128 L100 72'), ring(100, 116, 4.5, 'dot')])
    ]
};

// ---------- тарелка с салатом: питание ----------

const BOWL = {
    nodes: [
        ...[[82, 66], [100, 62], [118, 66]].map(([x, y], index) => fx(
            `M${x} ${y} C ${x - 6} ${y - 8}, ${x + 6} ${y - 14}, ${x} ${y - 24}`, 'sa-steam', { style: { '--i': index } })),
        main('M34 104 L166 104'),
        main('M40 104 C 40 140, 66 164, 100 164 C 134 164, 160 140, 160 104'),
        main('M80 162 L76 174 L124 174 L120 162'),
        group('sa-leaf sa-leaf--left', [
            main('M58 104 C 50 88, 58 74, 74 70 C 80 86, 74 100, 58 104'),
            detail('M61 100 L72 76')
        ]),
        group('sa-leaf sa-leaf--right', [
            main('M142 104 C 150 88, 142 74, 126 70 C 120 86, 126 100, 142 104'),
            detail('M139 100 L128 76')
        ]),
        // Вилка и нож по бокам
        main('M22 46 L22 86'),
        main('M14 46 L14 68 C 14 78, 18 82, 22 82 C 26 82, 30 78, 30 68 L30 46'),
        main(rr(17, 86, 10, 84, 5)),
        main('M176 104 L176 46 C 188 56, 192 86, 184 104 Z'),
        main(rr(174, 106, 12, 64, 6)),
        detail('M48 126 C 66 136, 134 136, 152 126'),
        // Горка голубики
        ring(89, 97, 6, 'accent'),
        ring(111, 97, 6, 'accent'),
        ring(100, 89, 6.5, 'accent'),
        detail('M98 87 L102 87 M100 85 L100 89')
    ]
};

// ---------- штанга в кулаках: базовые упражнения ----------

const BARBELL = {
    // Предплечья уходят вниз и растворяются — ниже этой полосы их не видно
    fade: [126, 180],
    nodes: [
        group('', [
            group('sa-lift', symmetric([
                main('M65 102 C 63 124, 62 150, 64 182'),
                main('M79 102 C 81 124, 84 150, 82 182')
            ]))
        ], { fade: true }),
        group('sa-lift', symmetric([
            // Блины, втулка и замок пружинят на концах грифа
            group('sa-whip', [
                main('M24 87 L13 87 Q9 87 9 92 Q9 97 13 97 L24 97'),
                main(rr(24, 44, 12, 96, 4)),
                main(rr(36, 58, 8, 68, 3)),
                main(rr(44, 84, 6, 16, 2)),
                detail('M30 54 L30 130')
            ]),
            main('M50 92 L63 92'),
            main('M81 92 L100 92'),
            main(rr(63, 82, 18, 20, 7)),
            detail('M67.5 84.5 L67.5 91 M72 84 L72 91 M76.5 84.5 L76.5 91'),
            detail('M65.5 97.5 C 69 100.5, 75 100.5, 78.5 97.5'),
            detail('M88 88 L88 96 M94 88 L94 96'),
            fx('M18 38 L12 30', 'sa-burst'),
            fx('M30 34 L30 24', 'sa-burst'),
            fx('M42 38 L48 30', 'sa-burst')
        ]))
    ]
};

// ---------- гантель: силовые ----------

const DUMBBELL_HALF = [
    main(rr(40, 91, 9, 18, 3)),
    main(rr(49, 72, 11, 56, 4)),
    main(rr(60, 62, 13, 76, 5)),
    main('M73 95 L100 95 M73 105 L100 105'),
    detail('M66.5 72 L66.5 128'),
    detail('M84 95 L84 105 M90 95 L90 105')
];

const DUMBBELL = {
    nodes: [
        group('sa-curl sa-curl--ghost', ghostOf(symmetric(DUMBBELL_HALF))),
        group('sa-curl', symmetric(DUMBBELL_HALF)),
        fx('M100 40 L100 28', 'sa-burst'),
        fx('M80 44 L73 34', 'sa-burst'),
        fx('M120 44 L127 34', 'sa-burst')
    ]
};

// ---------- гиря: функциональные ----------

const KETTLEBELL_BODY = [
    main('M72 92 C 62 70, 70 44, 100 44 C 130 44, 138 70, 128 92'),
    main('M84.7 87.5 C 78 72, 84 58, 100 58 C 116 58, 122 72, 115.3 87.5'),
    main('M72 92 C 86 84, 114 84, 128 92'),
    main('M128 92 C 146 102, 156 120, 154 140 C 153 156, 144 166, 130 170 L70 170 C 56 166, 47 156, 46 140 C 44 120, 54 102, 72 92'),
    detail('M62 128 C 63 114, 72 104, 86 100'),
    detail('M80 158 L120 158')
];

const KETTLEBELL = {
    nodes: [
        group('sa-swing sa-swing--ghost-2', ghostOf(KETTLEBELL_BODY)),
        group('sa-swing sa-swing--ghost-1', ghostOf(KETTLEBELL_BODY)),
        group('sa-swing', KETTLEBELL_BODY)
    ]
};

// ---------- скакалка: кардио ----------

const ROPE = 'M46 118 C 38 16, 162 16, 154 118';
const ECG_LOW = 'M12 184 L66 184 L74 172 L84 196 L94 176 L102 184 L188 184';

const JUMPROPE = {
    nodes: [
        detail(ECG_LOW),
        fx(ECG_LOW, 'sa-pulse', { measured: true }),
        fx(ROPE, 'sa-rope sa-rope--ghost-2'),
        fx(ROPE, 'sa-rope sa-rope--ghost-1'),
        main(ROPE, { cls: 'sa-rope' }),
        ...symmetric([
            main(rr(40, 126, 12, 44, 6)),
            main('M46 126 L46 118'),
            detail('M40 140 L52 140 M40 154 L52 154')
        ])
    ]
};

// ---------- кроссовка: бег ----------

const SNEAKER = {
    nodes: [
        ...[96, 112, 128].map((y, index) => fx(`M${index === 1 ? 0 : 8} ${y} L24 ${y}`, 'sa-speed', {
            style: { '--i': index }
        })),
        fx('M14 164 L190 164', 'sa-belt'),
        group('sa-step', [
            main('M32 136 C 26 116, 30 96, 44 84 C 56 90, 70 92, 82 86 C 86 78, 92 72, 102 72 C 116 84, 138 100, 160 108 C 174 114, 182 124, 182 136'),
            main('M32 136 C 28 146, 32 158, 46 158 L158 158 C 172 158, 184 150, 182 136'),
            main('M32 136 L182 136'),
            detail('M40 147 C 64 143, 92 151, 120 147 C 142 144, 160 149, 174 146'),
            detail('M111 77 L104 88 M122 85 L116 95 M134 92 L128 102 M146 99 L139 109'),
            detail('M98 73 C 96 66, 100 61, 107 62'),
            detail('M42 88 C 36 84, 34 78, 38 72'),
            detail('M158 136 C 160 124, 168 117, 178 119'),
            accent('M56 124 C 80 112, 112 108, 146 118')
        ])
    ]
};

// ---------- сердце с кардиограммой: здоровье ----------

const ECG_HEART = 'M10 108 L60 108 L70 90 L82 130 L94 70 L106 122 L114 108 L190 108';

const HEART = {
    nodes: [
        detail('M158 30 L158 44 M151 37 L165 37'),
        detail('M32 148 L32 158 M27 153 L37 153'),
        group('sa-beat', [
            main('M100 160 C 62 132, 34 108, 34 80 C 34 60, 49 46, 68 46 C 82 46, 94 54, 100 66 C 106 54, 118 46, 132 46 C 151 46, 166 60, 166 80 C 166 108, 138 132, 100 160 Z'),
            detail('M50 84 C 48 70, 56 60, 68 58')
        ]),
        accent(ECG_HEART),
        fx(ECG_HEART, 'sa-beat-pulse', { measured: true })
    ]
};

// ---------- коврик: растяжка ----------

// Скатка — архимедова спираль от центра к внешнему слою за 2,5 оборота
const MAT_SPIRAL = (() => {
    const points = Array.from({ length: 61 }, (_, index) => {
        const t = index / 60;
        const angle = t * 2.5 * 2 * Math.PI;
        const radius = 5 + 29 * t;
        return `${round(62 + radius * Math.cos(angle))} ${round(132 + radius * Math.sin(angle))}`;
    });
    return `M${points.join(' L')}`;
})();

const MAT = {
    nodes: [
        detail('M10 170 L190 170'),
        // Полотно лежит на полу и уходит под скатку
        group('sa-mat-flat', [main('M85.3 162 L184 162 L184 170')]),
        group('sa-mat-roll', [
            ring(62, 132, 38),
            group('sa-mat-spin', [detail(MAT_SPIRAL)])
        ]),
        // Йога-блок на дальнем конце коврика
        main('M132 162 L132 122 L168 122 L168 162'),
        main('M132 122 L140 114 L176 114 L168 122 M176 114 L176 154 L168 162'),
        detail('M140 134 L160 134 M140 142 L154 142'),
        ...[
            'M112 56 L112 74 M103 65 L121 65',
            'M156 80 L156 92 M150 86 L162 86',
            'M78 42 L78 52 M73 47 L83 47'
        ].map((d, index) => fx(d, 'sa-twinkle', { style: { '--i': index } }))
    ]
};

// ---------- планшет с планом: тренерство ----------

const CHECK_ROWS = [0, 1, 2, 3].map((index) => {
    const y = 72 + index * 28;
    return [
        main(rr(58, y, 14, 14, 3)),
        detail(`M82 ${y + 4} L${[140, 132, 140, 126][index]} ${y + 4} M82 ${y + 11} L${[116, 108, 122, 102][index]} ${y + 11}`),
        fx(`M61 ${y + 7.5} L64.5 ${y + 11} L70 ${y + 3}`, `sa-check sa-check--${index}`, { measured: true })
    ];
});

const CLIPBOARD = {
    nodes: [
        // Контур доски прерывается под зажимом
        main('M76 40 L56 40 Q44 40 44 52 L44 174 Q44 186 56 186 L144 186 Q156 186 156 174 L156 52 Q156 40 144 40 L124 40'),
        main('M76 54 L124 54 L124 44 Q124 38 118 38 L110 38 C 110 30, 90 30, 90 38 L82 38 Q76 38 76 44 Z'),
        ring(100, 36, 2.5, 'detail'),
        ...[].concat(...CHECK_ROWS),
        // Карандаш: остриё в (0, 0), корпус уходит вправо-вверх
        group('sa-pencil', [
            main('M0 0 L5.65 -12.73 M0 0 L12.73 -5.65'),
            main('M5.65 -12.73 L31.82 -38.89 M12.73 -5.65 L38.89 -31.82'),
            main('M31.82 -38.89 L38.89 -45.96 Q46.67 -46.67 45.96 -38.89 L38.89 -31.82'),
            detail('M5.65 -12.73 L12.73 -5.65'),
            detail('M31.82 -38.89 L38.89 -31.82')
        ])
    ]
};

const ARTS = {
    stopwatch: STOPWATCH,
    bowl: BOWL,
    barbell: BARBELL,
    dumbbell: DUMBBELL,
    kettlebell: KETTLEBELL,
    jumprope: JUMPROPE,
    sneaker: SNEAKER,
    heart: HEART,
    mat: MAT,
    clipboard: CLIPBOARD
};

const DRAWN = ['main', 'detail', 'accent'];

/*
  Задержки прорисовки считаются один раз на картинку: основные контуры по
  очереди, за ними детали, в конце акценты. Зеркальная половина ссылается на
  те же узлы — обе стороны рисуются одновременно.
*/
function assignDelays(nodes) {
    const seen = new Set();
    const queues = { main: [], detail: [], accent: [] };
    const walk = (list) => list.forEach((node) => {
        if (seen.has(node)) return;
        seen.add(node);
        if (node.el === 'g') walk(node.children);
        else if (queues[node.kind]) queues[node.kind].push(node);
    });
    walk(nodes);

    const spans = { main: 0.6, detail: 0.35, accent: 0.2 };
    let start = 0.05;
    DRAWN.forEach((kind) => {
        const queue = queues[kind];
        if (!queue.length) return;
        const step = queue.length > 1 ? Math.min(0.09, spans[kind] / (queue.length - 1)) : 0;
        queue.forEach((node, index) => {
            node.delay = Math.round((start + index * step) * 100) / 100;
        });
        start += (queue.length - 1) * step + 0.15;
    });
}

Object.values(ARTS).forEach((art) => assignDelays(art.nodes));

let instanceCounter = 0;

export default {
    name: 'SportArt',
    props: {
        // stopwatch, bowl, barbell, dumbbell, kettlebell, jumprope, sneaker, heart, mat, clipboard
        name: {
            type: String,
            required: true,
            validator: (value) => Object.prototype.hasOwnProperty.call(ARTS, value)
        }
    },
    data() {
        instanceCounter += 1;
        return { uid: `sport-art-${instanceCounter}`, free: false };
    },
    mounted() {
        // Вне <Reveal> прорисовываемся сами, сразу после монтирования
        const parent = this.$el.parentElement;
        if (!parent || !parent.closest('[data-sr-revealed]')) this.free = true;
    },
    render(h) {
        const art = ARTS[this.name] || ARTS.dumbbell;

        const renderNode = (node, key) => {
            if (node.el === 'g') {
                const attrs = {};
                if (node.mirror) attrs.transform = 'matrix(-1 0 0 1 200 0)';
                if (node.fade) attrs.mask = `url(#${this.uid}-fade)`;
                return h('g', { key, class: node.cls || null, attrs },
                    node.children.map((child, index) => renderNode(child, `${key}.${index}`)));
            }

            const drawn = DRAWN.includes(node.kind);
            const attrs = node.el === 'circle' ? { cx: node.cx, cy: node.cy, r: node.r } : { d: node.d };
            if (drawn || node.measured) attrs.pathLength = 1;
            const style = { ...node.style };
            if (drawn) style['--d'] = `${node.delay}s`;
            return h(node.el, { key, class: [`sa-${node.kind}`, drawn && 'sa-ln', node.cls], attrs, style });
        };

        const defs = art.fade ? [h('defs', [
            h('linearGradient', {
                attrs: { id: `${this.uid}-fade-grad`, gradientUnits: 'userSpaceOnUse', x1: 0, y1: art.fade[0], x2: 0, y2: art.fade[1] }
            }, [
                h('stop', { attrs: { offset: 0, 'stop-color': '#ffffff' } }),
                h('stop', { attrs: { offset: 1, 'stop-color': '#ffffff', 'stop-opacity': 0 } })
            ]),
            h('mask', {
                attrs: { id: `${this.uid}-fade`, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 200, height: 200 }
            }, [
                h('rect', { attrs: { width: 200, height: 200, fill: `url(#${this.uid}-fade-grad)` } })
            ])
        ])] : [];

        return h('svg', {
            class: ['sport-art', `sport-art--${this.name}`],
            attrs: {
                viewBox: '0 0 200 200',
                fill: 'none',
                'aria-hidden': 'true',
                focusable: 'false',
                'data-sr-revealed': this.free ? 'true' : null
            }
        }, [...defs, ...art.nodes.map((node, index) => renderNode(node, String(index)))]);
    }
};
</script>

<style scoped>
.sport-art {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
}

/* ---------- контуры: пока блок не проявился, их нет ---------- */

.sa-ln {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    transition: stroke 0.35s ease;
}

.sa-main {
    stroke: var(--art-line, #f8500a);
    stroke-width: 3;
}

.sa-detail {
    stroke: var(--art-detail, rgba(248, 80, 10, 0.45));
    stroke-width: 2;
}

.sa-accent {
    stroke: var(--art-accent, #3760e7);
    stroke-width: 3;
}

.sa-dot {
    fill: var(--art-line, #f8500a);
    opacity: 0;
    transition: fill 0.35s ease;
}

/* Эффекты появляются по своему расписанию */
.sa-fx {
    fill: none;
    stroke: var(--art-accent, #3760e7);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0;
    transition: stroke 0.35s ease;
}

/* Шлейф: прозрачность задаёт группа-копия */
.sa-ghost-ln {
    stroke: var(--art-line, #f8500a);
    stroke-width: 2.4;
    opacity: 1;
}

[data-sr-revealed="true"] .sa-ln {
    animation: sa-draw 0.9s cubic-bezier(0.65, 0, 0.35, 1) var(--d, 0s) forwards;
}

[data-sr-revealed="true"] .sa-dot {
    animation: sa-fade 0.4s ease-out 0.9s forwards;
}

/* ---------- секундомер: стрелка и дуга идут вместе ---------- */

.sa-hand,
.sa-sweep {
    transform-origin: 100px 116px;
}

.sa-sweep {
    stroke-width: 4;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    transform: rotate(-90deg);
}

.sa-speed {
    stroke-width: 2.6;
}

[data-sr-revealed="true"] .sa-hand {
    animation: sa-spin 6s linear 1.4s infinite;
}

[data-sr-revealed="true"] .sa-sweep {
    opacity: 1;
    animation: sa-sweep 6s linear 1.4s infinite;
}

[data-sr-revealed="true"] .sa-speed {
    animation: sa-speed 1.6s ease-in-out infinite;
    animation-delay: calc(1.4s + var(--i, 0) * 0.2s);
}

/* ---------- тарелка: пар поднимается, листья покачиваются ---------- */

.sa-steam {
    stroke: var(--art-detail, rgba(248, 80, 10, 0.45));
    stroke-width: 2.4;
}

.sa-leaf--left {
    transform-origin: 58px 104px;
}

.sa-leaf--right {
    transform-origin: 142px 104px;
}

[data-sr-revealed="true"] .sa-steam {
    animation: sa-steam 2.8s ease-in-out infinite;
    animation-delay: calc(1.2s + var(--i, 0) * 0.45s);
}

[data-sr-revealed="true"] .sa-leaf {
    animation: sa-sway 3.2s ease-in-out 1.4s infinite alternate both;
}

[data-sr-revealed="true"] .sa-leaf--right {
    animation-direction: alternate-reverse;
}

/* ---------- штанга: жим, концы грифа пружинят ---------- */

.sa-whip {
    transform-origin: 72px 92px;
}

.sa-burst {
    stroke-width: 2.6;
    transform-box: fill-box;
    transform-origin: center bottom;
}

[data-sr-revealed="true"] .sa-lift {
    animation: sa-press 2.8s ease-in-out 1.5s infinite both;
}

[data-sr-revealed="true"] .sa-whip {
    animation: sa-whip 2.8s ease-in-out 1.5s infinite both;
}

[data-sr-revealed="true"] .sa-burst {
    animation: sa-burst 2.8s ease-out 1.5s infinite;
}

/* ---------- гантель: подъём по дуге со шлейфом ---------- */

.sa-curl {
    transform-origin: 100px 100px;
}

.sa-curl--ghost {
    --ghost: 0.22;
    opacity: 0;
}

[data-sr-revealed="true"] .sa-curl {
    animation: sa-curl 2.8s ease-in-out 1.5s infinite both;
}

[data-sr-revealed="true"] .sa-curl--ghost {
    animation:
        sa-curl 2.8s ease-in-out 1.62s infinite both,
        sa-ghost 0.6s ease-out 1.5s forwards;
}

/* ---------- гиря: мах маятником, за ней два следа ---------- */

.sa-swing {
    transform-origin: 100px 36px;
}

.sa-swing--ghost-1 {
    --lag: 0.08s;
    --ghost: 0.26;
    opacity: 0;
}

.sa-swing--ghost-2 {
    --lag: 0.16s;
    --ghost: 0.12;
    opacity: 0;
}

[data-sr-revealed="true"] .sa-swing {
    animation: sa-swing 2.4s ease-in-out 1.5s infinite both;
}

[data-sr-revealed="true"] .sa-swing--ghost-1,
[data-sr-revealed="true"] .sa-swing--ghost-2 {
    animation:
        sa-swing 2.4s ease-in-out calc(1.5s + var(--lag)) infinite both,
        sa-ghost 0.6s ease-out 1.5s forwards;
}

/* ---------- скакалка: верёвка «вращается» вокруг линии ручек ---------- */

.sa-rope {
    transform-origin: 100px 118px;
}

.sa-fx.sa-rope {
    stroke: var(--art-line, #f8500a);
    stroke-width: 2.4;
}

.sa-rope--ghost-1 {
    --lag: 0.05s;
    --ghost: 0.3;
}

.sa-rope--ghost-2 {
    --lag: 0.1s;
    --ghost: 0.14;
}

[data-sr-revealed="true"] .sa-ln.sa-rope {
    animation:
        sa-draw 0.9s cubic-bezier(0.65, 0, 0.35, 1) var(--d, 0s) forwards,
        sa-rope 1.1s 1.6s infinite;
}

[data-sr-revealed="true"] .sa-fx.sa-rope {
    animation:
        sa-ghost 0.5s ease-out 1.6s forwards,
        sa-rope 1.1s calc(1.6s + var(--lag)) infinite;
}

.sa-pulse,
.sa-beat-pulse {
    stroke-width: 3.4;
    stroke-dasharray: 0.1 0.9;
    stroke-dashoffset: 1;
}

[data-sr-revealed="true"] .sa-pulse {
    animation: sa-run 2.2s linear 1.8s infinite;
}

/* ---------- кроссовка: шаг по бегущей дорожке ---------- */

.sa-step {
    transform-origin: 107px 158px;
}

.sa-belt {
    stroke: var(--art-detail, rgba(248, 80, 10, 0.45));
    stroke-width: 2;
    stroke-dasharray: 14 10;
}

[data-sr-revealed="true"] .sa-step {
    animation: sa-step 0.9s ease-in-out 1.5s infinite both;
}

[data-sr-revealed="true"] .sa-belt {
    animation:
        sa-fade 0.5s ease-out 1s forwards,
        sa-belt 0.45s linear 1.5s infinite;
}

/* ---------- сердце: двойной удар и бегущий импульс ---------- */

.sa-beat {
    transform-origin: 100px 104px;
}

.sa-beat-pulse {
    stroke: var(--art-line, #f8500a);
}

[data-sr-revealed="true"] .sa-beat {
    animation: sa-beat 1.3s ease-in-out 1.6s infinite;
}

[data-sr-revealed="true"] .sa-beat-pulse {
    animation: sa-run 1.3s linear 1.6s infinite;
}

/* ---------- коврик: скатка катится, полотно укорачивается ---------- */

.sa-mat-spin {
    transform-origin: 62px 132px;
}

.sa-mat-flat {
    transform-origin: 184px 162px;
}

.sa-twinkle {
    stroke-width: 2.4;
    transform-box: fill-box;
    transform-origin: center;
}

[data-sr-revealed="true"] .sa-mat-roll {
    animation: sa-mat-roll 4.8s ease-in-out 1.6s infinite alternate both;
}

[data-sr-revealed="true"] .sa-mat-spin {
    animation: sa-mat-spin 4.8s ease-in-out 1.6s infinite alternate both;
}

[data-sr-revealed="true"] .sa-mat-flat {
    animation: sa-mat-flat 4.8s ease-in-out 1.6s infinite alternate both;
}

[data-sr-revealed="true"] .sa-twinkle {
    animation: sa-twinkle 2.4s ease-in-out infinite;
    animation-delay: calc(1.6s + var(--i, 0) * 0.7s);
}

/* ---------- планшет: карандаш отмечает пункты по одному ---------- */

.sa-check {
    stroke-width: 3.2;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
}

.sa-pencil {
    opacity: 0;
    transform: translate(112px, 176px);
}

[data-sr-revealed="true"] .sa-check {
    opacity: 1;
    animation: sa-check-0 8s linear 1.4s infinite;
}

[data-sr-revealed="true"] .sa-check--1 {
    animation-name: sa-check-1;
}

[data-sr-revealed="true"] .sa-check--2 {
    animation-name: sa-check-2;
}

[data-sr-revealed="true"] .sa-check--3 {
    animation-name: sa-check-3;
}

[data-sr-revealed="true"] .sa-pencil {
    animation:
        sa-fade 0.5s ease-out 1.1s forwards,
        sa-pencil 8s ease-in-out 1.4s infinite both;
}

/* ---------- ключевые кадры ---------- */

@keyframes sa-draw {
    to {
        stroke-dashoffset: 0;
    }
}

@keyframes sa-fade {
    to {
        opacity: 1;
    }
}

@keyframes sa-ghost {
    to {
        opacity: var(--ghost, 0.22);
    }
}

@keyframes sa-spin {
    to {
        transform: rotate(360deg);
    }
}

@keyframes sa-sweep {
    from {
        stroke-dashoffset: 1;
    }

    to {
        stroke-dashoffset: 0;
    }
}

@keyframes sa-speed {
    0% {
        opacity: 0;
        transform: translateX(10px);
    }

    35% {
        opacity: 1;
    }

    100% {
        opacity: 0;
        transform: translateX(-12px);
    }
}

@keyframes sa-steam {
    0% {
        opacity: 0;
        transform: translateY(10px);
    }

    35% {
        opacity: 1;
    }

    100% {
        opacity: 0;
        transform: translateY(-12px);
    }
}

@keyframes sa-sway {
    from {
        transform: rotate(-4deg);
    }

    to {
        transform: rotate(3deg);
    }
}

@keyframes sa-press {

    0%,
    100% {
        transform: translateY(16px);
    }

    45%,
    55% {
        transform: translateY(-10px);
    }
}

/* Разгон вверх — концы отстают и проседают, торможение — уходят выше */
@keyframes sa-whip {

    0%,
    50%,
    100% {
        transform: rotate(0deg);
    }

    10% {
        transform: rotate(-2.5deg);
    }

    38% {
        transform: rotate(2deg);
    }

    62% {
        transform: rotate(1.5deg);
    }

    90% {
        transform: rotate(-2deg);
    }
}

/* Вспышка «силы» в верхней точке */
@keyframes sa-burst {

    0%,
    40% {
        opacity: 0;
        transform: scale(0.5);
    }

    50% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }

    64%,
    100% {
        opacity: 0;
        transform: translateY(-6px) scale(1.1);
    }
}

@keyframes sa-curl {

    0%,
    100% {
        transform: translate(-6px, 18px) rotate(-12deg);
    }

    50% {
        transform: translate(4px, -12px) rotate(6deg);
    }
}

@keyframes sa-swing {

    0%,
    100% {
        transform: rotate(14deg);
    }

    50% {
        transform: rotate(-14deg);
    }
}

/* Проекция вращения: высота дуги меняется по косинусу */
@keyframes sa-rope {
    0% {
        transform: scaleY(1);
        animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0);
    }

    25% {
        transform: scaleY(0);
        animation-timing-function: cubic-bezier(0.61, 1, 0.88, 1);
    }

    50% {
        transform: scaleY(-0.6);
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

/* Импульс пробегает линию от начала до конца */
@keyframes sa-run {
    0% {
        stroke-dashoffset: 1;
        opacity: 0;
    }

    10%,
    85% {
        opacity: 1;
    }

    100% {
        stroke-dashoffset: 0;
        opacity: 0;
    }
}

/* Касание пяткой → перекат → толчок носком → полёт */
@keyframes sa-step {

    0%,
    100% {
        transform: translateY(0) rotate(-5deg);
    }

    30% {
        transform: translateY(0) rotate(0deg);
    }

    55% {
        transform: translateY(-3px) rotate(7deg);
    }

    78% {
        transform: translateY(-12px) rotate(1deg);
    }
}

@keyframes sa-belt {
    to {
        stroke-dashoffset: 24;
    }
}

@keyframes sa-beat {

    0%,
    20%,
    45%,
    100% {
        transform: scale(1);
    }

    10% {
        transform: scale(1.08);
    }

    30% {
        transform: scale(1.05);
    }
}

/* Скатка катится без проскальзывания: 28px пути — 42,2° поворота при r = 38.
   Полотно от точки касания до конца укорачивается с 98,7 до 70,7 */
@keyframes sa-mat-roll {
    from {
        transform: translateX(0);
    }

    to {
        transform: translateX(28px);
    }
}

@keyframes sa-mat-spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(42.2deg);
    }
}

@keyframes sa-mat-flat {
    from {
        transform: scaleX(1);
    }

    to {
        transform: scaleX(0.716);
    }
}

@keyframes sa-twinkle {

    0%,
    100% {
        opacity: 0;
        transform: scale(0.4);
    }

    50% {
        opacity: 1;
        transform: scale(1);
    }
}

/* Галочки ставятся по очереди, держатся и вместе гаснут перед новым кругом */
@keyframes sa-check-0 {

    0%,
    8% {
        stroke-dashoffset: 1;
        opacity: 1;
    }

    14%,
    88% {
        stroke-dashoffset: 0;
        opacity: 1;
    }

    94%,
    100% {
        stroke-dashoffset: 0;
        opacity: 0;
    }
}

@keyframes sa-check-1 {

    0%,
    25% {
        stroke-dashoffset: 1;
        opacity: 1;
    }

    31%,
    88% {
        stroke-dashoffset: 0;
        opacity: 1;
    }

    94%,
    100% {
        stroke-dashoffset: 0;
        opacity: 0;
    }
}

@keyframes sa-check-2 {

    0%,
    42% {
        stroke-dashoffset: 1;
        opacity: 1;
    }

    48%,
    88% {
        stroke-dashoffset: 0;
        opacity: 1;
    }

    94%,
    100% {
        stroke-dashoffset: 0;
        opacity: 0;
    }
}

@keyframes sa-check-3 {

    0%,
    59% {
        stroke-dashoffset: 1;
        opacity: 1;
    }

    65%,
    88% {
        stroke-dashoffset: 0;
        opacity: 1;
    }

    94%,
    100% {
        stroke-dashoffset: 0;
        opacity: 0;
    }
}

/* Остриё карандаша ведёт каждую галочку: начало → изгиб → конец */
@keyframes sa-pencil {
    0% {
        transform: translate(74px, 68px);
    }

    8% {
        transform: translate(61px, 79.5px);
        animation-timing-function: linear;
    }

    10% {
        transform: translate(64.5px, 83px);
        animation-timing-function: linear;
    }

    14% {
        transform: translate(70px, 75px);
    }

    18% {
        transform: translate(74px, 98px);
    }

    25% {
        transform: translate(61px, 107.5px);
        animation-timing-function: linear;
    }

    27% {
        transform: translate(64.5px, 111px);
        animation-timing-function: linear;
    }

    31% {
        transform: translate(70px, 103px);
    }

    35% {
        transform: translate(74px, 126px);
    }

    42% {
        transform: translate(61px, 135.5px);
        animation-timing-function: linear;
    }

    44% {
        transform: translate(64.5px, 139px);
        animation-timing-function: linear;
    }

    48% {
        transform: translate(70px, 131px);
    }

    52% {
        transform: translate(74px, 154px);
    }

    59% {
        transform: translate(61px, 163.5px);
        animation-timing-function: linear;
    }

    61% {
        transform: translate(64.5px, 167px);
        animation-timing-function: linear;
    }

    65% {
        transform: translate(70px, 159px);
    }

    72%,
    88% {
        transform: translate(112px, 176px);
    }

    100% {
        transform: translate(74px, 68px);
    }
}

/* Без анимаций — сразу готовая картинка */
@media (prefers-reduced-motion: reduce) {
    .sport-art * {
        animation: none !important;
    }

    .sa-ln {
        stroke-dashoffset: 0;
    }

    .sa-dot,
    .sa-pencil,
    .sa-belt,
    .sa-check {
        opacity: 1;
    }

    .sa-check {
        stroke-dashoffset: 0;
    }

    .sa-sweep {
        opacity: 1;
        stroke-dashoffset: 0.68;
    }
}
</style>
