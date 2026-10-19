<template>
    <div class="flip-grid">
        <Reveal class="flip-cell" variant="dropZ" :amount="0.2" :delay="100">
            <FlipCard art="stopwatch" title="Распорядок дня" icon="fa-regular fa-clock">
                <h4 class="flip-heading">Распорядок дня</h4>
                <ul class="flip-list">
                    <li v-for="row in routine" :key="row.time">
                        <span class="flip-time">{{ row.time }}</span>
                        <span>{{ row.text }}</span>
                    </li>
                </ul>
            </FlipCard>
            <span class="beat-marker" :style="{ '--i': 0 }" aria-hidden="true"><i class="fa-solid fa-heart-pulse"></i></span>
        </Reveal>

        <Reveal class="flip-cell" variant="dropZ" :amount="0.2" :delay="210">
            <FlipCard art="bowl" title="Примеры блюд" icon="fa-solid fa-utensils">
                <h4 class="flip-heading">Примеры блюд</h4>
                <div v-for="group in meals" :key="group.title" class="flip-group">
                    <span class="flip-group-title">{{ group.title }}</span>
                    <ul class="flip-list flip-list--compact">
                        <li v-for="dish in group.items" :key="dish">{{ dish }}</li>
                    </ul>
                </div>
            </FlipCard>
            <span class="beat-marker" :style="{ '--i': 1 }" aria-hidden="true"><i class="fa-solid fa-heart-pulse"></i></span>
        </Reveal>

        <Reveal class="flip-cell" variant="dropZ" :amount="0.2" :delay="320">
            <FlipCard art="barbell" title="Базовые упражнения" icon="fa-solid fa-dumbbell">
                <h4 class="flip-heading">Базовые упражнения</h4>
                <ul class="flip-list flip-list--stacked">
                    <li v-for="exercise in exercises" :key="exercise.name">
                        <b>{{ exercise.name }}</b>
                        <span>{{ exercise.text }}</span>
                    </li>
                </ul>
            </FlipCard>
            <span class="beat-marker" :style="{ '--i': 2 }" aria-hidden="true"><i class="fa-solid fa-heart-pulse"></i></span>
        </Reveal>
    </div>
</template>

<script>
import Reveal from '@/components/ui/Reveal.vue';
import FlipCard from '@/components/flip/FlipCard.vue';

export default {
    name: 'ScheduleCards',
    components: { Reveal, FlipCard },
    props: {
        // Распорядок дня у тренера и клиента разный: [{ time, text }]
        routine: { type: Array, required: true }
    },
    data() {
        return {
            meals: [
                { title: 'Завтрак', items: ['Белковый смузи', 'Омлет с овощами', 'Тост с авокадо и лососем'] },
                { title: 'Обед', items: ['Куриные грудки с картофельным пюре', 'Греческий йогурт с орехами и мёдом'] },
                { title: 'Ужин', items: ['Тунец на гриле с овощами', 'Зелёный салат с крабовыми палочками'] }
            ],
            exercises: [
                { name: 'Жим штанги', text: 'базовое упражнение для грудных, плеч и трицепса' },
                { name: 'Становая тяга', text: 'базовое упражнение для спины и ног' },
                { name: 'Присед со штангой', text: 'базовое упражнение для низа тела' }
            ]
        };
    }
};
</script>

<style scoped>
.flip-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
}

.flip-cell {
    position: relative;
    height: 460px;
}

/* Дополнения к разметке слота — базовые стили списков в FlipCard */
.flip-list--compact {
    gap: 4px !important;
}

.flip-list--compact li::before {
    content: "";
    flex: none;
    width: 6px;
    height: 6px;
    margin-top: 0.55em;
    border-radius: 50%;
    background: var(--tt-brand);
}

.flip-list--stacked li {
    flex-direction: column;
    gap: 2px !important;
}

@media (max-width: 960px) {
    .flip-grid {
        grid-template-columns: minmax(0, 1fr);
        max-width: 460px;
        margin-inline: auto;
    }

    .flip-cell {
        height: 440px;
    }
}
</style>
