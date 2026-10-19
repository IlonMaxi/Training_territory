<template>
    <!-- tabindex: с клавиатуры карточка переворачивается при фокусе (:focus-visible —
         чтобы после клика мышью она не залипала перевёрнутой) -->
    <div :class="['flip-card', { 'is-flipped': flipped }]" tabindex="0" @click="toggle">
        <div class="flip-card-inner">
            <div class="flip-card-front">
                <!-- Линейная иллюстрация вместо фото: своя, грузить нечего -->
                <SportArt :name="art" class="front-art" />
                <div class="front-content">
                    <span v-if="icon" class="tt-icon-tile front-icon"><i :class="icon"></i></span>
                    <h3 v-if="title" class="front-title">{{ title }}</h3>
                    <span class="front-hint">
                        <i class="fa-solid fa-rotate"></i>
                        <span class="hint-hover">Наведите, чтобы перевернуть</span>
                        <span class="hint-touch">Нажмите, чтобы перевернуть</span>
                    </span>
                </div>
            </div>
            <div class="flip-card-back">
                <div class="text-on-back">
                    <slot />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import SportArt from '@/components/ui/SportArt.vue';

export default {
    name: 'FlipCard',
    components: { SportArt },
    props: {
        // Название иллюстрации на лицевой стороне — см. SportArt
        art: {
            type: String,
            required: true
        },
        title: {
            type: String,
            default: ''
        },
        icon: {
            type: String,
            default: ''
        }
    },
    data() {
        return { flipped: false };
    },
    methods: {
        // На тач-экранах наведения нет — переворачиваем по нажатию.
        // С мышью переворот делает :hover, а клик ничего не меняет.
        toggle() {
            if (window.matchMedia && window.matchMedia('(hover: none)').matches) {
                this.flipped = !this.flipped;
            }
        }
    }
};
</script>

<style scoped>
/*
  Карточка должна быть стабильной целью для :hover — размеры задаются здесь,
  а вращается только .flip-card-inner. Раньше .flip-card схлопывалась в нулевую
  высоту, а стороны стояли друг под другом: при повороте курсор терял элемент,
  hover слетал и карточка начинала мигать.
*/
.flip-card {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: var(--tt-radius-lg);
    perspective: 1200px;
    cursor: pointer;
    outline: none;
}

.flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    transition: transform 0.7s cubic-bezier(0.2, 0.7, 0.3, 1);
    transform-style: preserve-3d;
}

.flip-card:hover .flip-card-inner,
.flip-card:focus-visible .flip-card-inner,
.flip-card.is-flipped .flip-card-inner {
    transform: rotateY(180deg);
}

.flip-card:focus-visible {
    box-shadow: 0 0 0 3px rgba(248, 80, 10, 0.45);
}

/* Обе стороны лежат друг на друге, а не в потоке одна под другой */
.flip-card-front,
.flip-card-back {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border: 1px solid var(--tt-line-brand, rgba(248, 80, 10, 0.26));
    border-radius: inherit;
    box-shadow: var(--tt-shadow-card, 0 6px 18px rgba(15, 20, 39, 0.05));
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transition: box-shadow 0.35s ease, border-color 0.35s ease;
}

.flip-card:hover .flip-card-front,
.flip-card:hover .flip-card-back {
    border-color: rgba(248, 80, 10, 0.5);
    box-shadow: var(--tt-shadow-hover, 0 18px 44px rgba(248, 80, 10, 0.16));
}

/*
  Лицевая сторона — фирменный оранжевый градиент: светлое пятно за рисунком,
  точечная сетка сверху и затемнение снизу, чтобы белый текст читался.
  Линии иллюстрации белые, акценты — тёмно-синие.
*/
.flip-card-front {
    --art-line: #ffffff;
    --art-detail: rgba(255, 255, 255, 0.58);
    --art-accent: #16203a;
    background:
        radial-gradient(circle at 50% 34%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 44%),
        linear-gradient(180deg, rgba(120, 34, 0, 0) 52%, rgba(120, 34, 0, 0.5) 100%),
        var(--tt-gradient-brand);
}

.flip-card-front::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.2) 1.2px, transparent 1.7px);
    background-size: 18px 18px;
    -webkit-mask-image: linear-gradient(180deg, #000000 0%, transparent 70%);
    mask-image: linear-gradient(180deg, #000000 0%, transparent 70%);
}

/* Через .flip-card-front — чтобы перебить размеры из стилей самого SportArt */
.flip-card-front .front-art {
    position: absolute;
    top: 22px;
    left: 50%;
    width: min(74%, 280px);
    height: auto;
    aspect-ratio: 1;
    transform: translateX(-50%);
    transition: transform 0.6s var(--tt-ease, ease);
}

.flip-card:hover .flip-card-front .front-art {
    transform: translateX(-50%) scale(1.04);
}

.front-content {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 24px;
    color: #ffffff;
}

/* Белая плашка .tt-icon-tile на оранжевом, чуть меньше стандартной */
.front-icon {
    width: 44px;
    height: 44px;
    background-color: #ffffff;
    box-shadow: 0 12px 24px -12px rgba(120, 34, 0, 0.8);
    font-size: 18px;
}

.front-title {
    margin: 0;
    color: #ffffff;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.01em;
}

.front-hint {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.86);
    font-size: 13px;
    font-weight: 500;
}

.hint-touch {
    display: none;
}

@media (hover: none) {
    .hint-hover {
        display: none;
    }

    .hint-touch {
        display: inline;
    }
}

.flip-card-back {
    transform: rotateY(180deg);
    background:
        radial-gradient(120% 90% at 100% 0%, rgba(248, 80, 10, 0.1) 0%, transparent 60%),
        var(--tt-surface, #ffffff);
}

.text-on-back {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    padding: 28px;
    overflow: auto;
    color: var(--tt-soft, #3c4460);
    font-size: 14px;
    line-height: 1.55;
    text-align: left;
}

/* Разметка содержимого задаётся снаружи, в слоте */
.text-on-back ::v-deep .flip-heading {
    margin: 0 0 14px;
    color: var(--tt-ink, #0f1427);
    font-size: 18px;
    font-weight: 700;
}

.text-on-back ::v-deep .flip-list {
    display: grid;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
}

.text-on-back ::v-deep .flip-list li {
    display: flex;
    gap: 12px;
}

.text-on-back ::v-deep .flip-time {
    flex: none;
    min-width: 92px;
    color: var(--tt-brand-deep, #c2410c);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
}

.text-on-back ::v-deep .flip-group+.flip-group {
    margin-top: 14px;
}

.text-on-back ::v-deep .flip-group-title {
    display: block;
    margin-bottom: 6px;
    color: var(--tt-brand-deep, #c2410c);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.text-on-back ::v-deep .flip-list b {
    color: var(--tt-ink, #0f1427);
    font-weight: 600;
}

@media (prefers-reduced-motion: reduce) {

    .flip-card-inner,
    .flip-card-front .front-art {
        transition: none;
    }

    .flip-card:hover .flip-card-front .front-art {
        transform: translateX(-50%);
    }
}
</style>
