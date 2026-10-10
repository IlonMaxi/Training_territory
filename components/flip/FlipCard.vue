<template>
    <div class="flip-card">
        <div class="flip-card-inner">
            <div class="flip-card-front">
                <img :src="image" :alt="alt" class="flip-image">
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
export default {
    name: 'FlipCard',
    props: {
        image: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            default: ''
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
    perspective: 1000px;
}

.flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.3, 1);
    transform-style: preserve-3d;
}

.flip-card:hover .flip-card-inner,
.flip-card:focus-within .flip-card-inner {
    transform: rotateY(180deg);
}

/* Обе стороны лежат друг на друге, а не в потоке одна под другой */
.flip-card-front,
.flip-card-back {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 20px;
    overflow: hidden;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
}

.flip-card-back {
    transform: rotateY(180deg);
    background-color: var(--background-color);
    transition: background-color 0.5s ease, color 0.5s ease;
}

.flip-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.text-on-back {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    text-align: center;
    color: var(--text-color);
}

@media (prefers-reduced-motion: reduce) {
    .flip-card-inner {
        transition: none;
    }
}
</style>
