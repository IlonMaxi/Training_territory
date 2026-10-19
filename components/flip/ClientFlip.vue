<template>
    <main class="tt-main">
        <HomeHero eyebrow="Для клиентов"
            lead="Здесь вы найдёте всё, чтобы добиться прогресса в спорте: тренировки от вашего тренера, рацион на каждый день и замеры тела — в одном личном кабинете."
            :bullets="bullets" cta-label="Начать тренироваться" anchor="schedule-section" anchor-label="Как это устроено"
            @register="$emit('open-register-modal')">
            <template #title>
                Добивайтесь <span class="accent-word">прогресса</span> в спорте
            </template>
        </HomeHero>

        <HomeStats :stats="stats" />

        <!-- Расписание -->
        <section id="schedule-section" class="tt-container" aria-labelledby="schedule-title">
            <SectionHead eyebrow="Расписание" title-id="schedule-title"
                lead="Распорядок дня, питание и базовые упражнения — из этого складывается ваш результат.">
                Насколько оно <span class="tt-accent">важно для клиента?</span>
            </SectionHead>
            <ScheduleCards :routine="routine" />
        </section>

        <!-- Поддержка -->
        <section class="tt-container" aria-labelledby="support-title">
            <SectionHead eyebrow="Поддержка" title-id="support-title">
                Тренер рядом <span class="tt-accent">на каждом этапе</span>
            </SectionHead>
            <FeatureCards :items="support" :columns="3" beat />
        </section>

        <!-- Тренерство -->
        <section id="trainer-section" class="tt-container" aria-labelledby="coaching-title">
            <SectionHead eyebrow="Тренерство" title-id="coaching-title"
                lead="Тренер подберёт направление под вашу цель и уровень подготовки — и проведёт по нему шаг за шагом.">
                Тренируйтесь с <span class="tt-accent">профессионалами</span>
            </SectionHead>

            <!-- Направления с линейными иллюстрациями: при наведении плитка
                 заливается оранжевым, линии становятся белыми -->
            <ul class="directions">
                <Reveal v-for="(item, index) in directions" :key="item.art" as="li" class="direction-cell"
                    variant="bubbleSoft" :amount="0.2" :delay="(index % 3) * 90">
                    <article class="tt-card tt-card--lift direction">
                        <div class="direction-art">
                            <SportArt :name="item.art" />
                        </div>
                        <div class="direction-body">
                            <h3 class="direction-title">{{ item.title }}</h3>
                            <p class="direction-text">{{ item.text }}</p>
                        </div>
                    </article>
                </Reveal>
            </ul>
        </section>

        <CtaSection title="Начните путь к результату"
            text="Создайте аккаунт клиента — тренировки, питание и прогресс будут в одном личном кабинете."
            @register="$emit('open-register-modal')"
            @login="$emit('open-login-modal')" />

        <BadgeConnectors />
    </main>
</template>

<script>
import Reveal from '@/components/ui/Reveal.vue';
import SportArt from '@/components/ui/SportArt.vue';
import HomeHero from '@/components/home/HomeHero.vue';
import HomeStats from '@/components/home/HomeStats.vue';
import SectionHead from '@/components/ui/SectionHead.vue';
import FeatureCards from '@/components/home/FeatureCards.vue';
import ScheduleCards from '@/components/home/ScheduleCards.vue';
import CtaSection from '@/components/home/CtaSection.vue';
import BadgeConnectors from '@/components/home/BadgeConnectors.vue';

export default {
    name: 'ClientFlip',
    components: {
        Reveal,
        SportArt,
        HomeHero,
        HomeStats,
        SectionHead,
        FeatureCards,
        ScheduleCards,
        CtaSection,
        BadgeConnectors
    },
    data() {
        return {
            bullets: [
                { icon: 'fa-solid fa-calendar-days', lead: 'Расписание тренировок ', accent: 'от вашего тренера' },
                { icon: 'fa-solid fa-utensils', lead: 'Рацион на каждый день — ', accent: 'с учётом тренировок' },
                { icon: 'fa-solid fa-chart-line', lead: 'Замеры и графики — ', accent: 'прогресс в процентах' }
            ],
            // Цифры — из устройства платформы: справочник упражнений
            // и генератор рациона (3 приёма пищи на 7 дней вперёд)
            stats: [
                { icon: 'fa-solid fa-dumbbell', value: 900, suffix: '+', label: 'упражнений в справочнике, из которых тренер собирает ваши тренировки' },
                { icon: 'fa-solid fa-calendar-week', value: 7, label: 'дней вперёд — на столько рацион составляется автоматически' },
                { icon: 'fa-solid fa-utensils', value: 3, label: 'приёма пищи в день с учётом тренировок, пола и аллергий' }
            ],
            support: [
                {
                    icon: 'fa-solid fa-stethoscope',
                    title: 'Здоровье и форма',
                    text: 'Тренер играет важную роль в помощи своим подопечным в достижении здоровья и физической формы. Он может разработать индивидуальную программу тренировок и питания, определить цели и помочь создать план действий.'
                },
                {
                    icon: 'fa-solid fa-head-side-virus',
                    title: 'Правильная техника',
                    text: 'Тренер имеет ключевое значение в помощи подопечному отработать правильную технику в упражнениях. Он может дать детальные инструкции и наглядно продемонстрировать, как выполнять упражнения правильно и безопасно.'
                },
                {
                    icon: 'fa-solid fa-people-arrows',
                    title: 'Ментальная поддержка',
                    text: 'Ментальная поддержка тренера является неотъемлемой частью его роли в помощи подопечному. Он может привносить в тренировки элементы позитивной атмосферы и поддержки, создавая мотивационную среду для достижения целей.'
                }
            ],
            routine: [
                { time: '10:00–12:00', text: 'Тренировка в фитнес-центре' },
                { time: '12:30–13:00', text: 'Полдник (орехи и ягоды)' },
                { time: '13:00–14:00', text: 'Обед (курица гриль с овощами)' },
                { time: '19:00–20:00', text: 'Ужин (рыба с овощами и гречкой)' }
            ],
            directions: [
                { art: 'dumbbell', title: 'Силовые', text: 'Сила и мышечная масса — с правильной техникой в каждом подходе.' },
                { art: 'kettlebell', title: 'Функциональные', text: 'Баланс, координация и выносливость для повседневной жизни.' },
                { art: 'jumprope', title: 'Кардио', text: 'Пульс в нужной зоне и сжигание калорий без скуки.' },
                { art: 'sneaker', title: 'Бег', text: 'Темп, дистанция и восстановление — по плану тренера.' },
                { art: 'mat', title: 'Растяжка', text: 'Гибкость и подвижность суставов, меньше зажимов и травм.' },
                { art: 'heart', title: 'Здоровье', text: 'Нагрузка по самочувствию и пульсу — без перегрузок.' }
            ]
        };
    }
};
</script>

<style scoped>
/* ---------- направления тренировок ---------- */

.directions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
    margin: 0;
    padding: 0;
    list-style: none;
}

/* Ячейка — <Reveal>: сама анимирует появление, поэтому подъём при
   наведении живёт на вложенной карточке */
.direction-cell {
    display: flex;
}

.direction {
    display: flex;
    flex-direction: column;
    gap: 18px;
    width: 100%;
    padding: 12px 12px 22px;
}

.direction-art {
    --art-detail: rgba(248, 80, 10, 0.42);
    position: relative;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border-radius: var(--tt-radius-md);
    background:
        radial-gradient(circle at 50% 56%, rgba(248, 80, 10, 0.12) 0%, rgba(248, 80, 10, 0) 58%),
        var(--tt-brand-50);
}

/* Оранжевая заливка проявляется поверх светлой подложки */
.direction-art::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
        radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 55%),
        var(--tt-gradient-brand);
    opacity: 0;
    transition: opacity 0.45s ease;
}

.direction-art .sport-art {
    position: relative;
}

/* В тёмной теме синий акцент светлее, штрихи ярче */
body.dark-theme .direction-art {
    --art-detail: rgba(255, 138, 76, 0.5);
    --art-accent: #8fa8ff;
}

.direction:hover .direction-art {
    --art-line: #ffffff;
    --art-detail: rgba(255, 255, 255, 0.6);
    --art-accent: #16203a;
}

.direction:hover .direction-art::before {
    opacity: 1;
}

.direction-body {
    display: grid;
    gap: 6px;
    padding: 0 10px;
}

.direction-title {
    margin: 0;
    color: var(--tt-ink);
    font-size: 19px;
    font-weight: 700;
    letter-spacing: -0.01em;
}

.direction-text {
    margin: 0;
    color: var(--tt-soft);
    font-size: 14.5px;
    line-height: 1.5;
}

@media (max-width: 900px) {
    .directions {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
    }
}

/* На телефоне — строка: картинка слева, текст справа */
@media (max-width: 560px) {
    .directions {
        grid-template-columns: minmax(0, 1fr);
        gap: 12px;
    }

    .direction {
        flex-direction: row;
        align-items: center;
        gap: 14px;
        padding: 10px 16px 10px 10px;
    }

    .direction-art {
        flex: none;
        width: 104px;
        aspect-ratio: 1;
    }

    .direction-body {
        padding: 0;
    }

    .direction-title {
        font-size: 17px;
    }

    .direction-text {
        font-size: 14px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .direction-art::before {
        transition: none;
    }
}
</style>
