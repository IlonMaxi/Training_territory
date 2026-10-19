<template>
    <main class="tt-main">
        <HomeHero eyebrow="Платформа для тренеров"
            lead="Здесь вы найдёте всё необходимое для успешной работы тренера в спорте: клиенты, расписание и программы тренировок — в одном кабинете."
            :bullets="bullets" cta-label="Начать работу" anchor="trainer-section" anchor-label="Как это устроено"
            figure="fitgirl" @register="$emit('open-register-modal')">
            <template #title>
                Работайте с клиентами<br>
                <FlipWords class="accent-word" :words="['эффективно', 'легко', 'удобно']" />
            </template>
        </HomeHero>

        <HomeStats :stats="stats" />

        <!-- Тренерство -->
        <section id="trainer-section" class="tt-container" aria-labelledby="trainer-title">
            <SectionHead eyebrow="Тренерство" title-id="trainer-title">
                Комьюнити и <span class="tt-accent">профессиональный рост</span>
            </SectionHead>

            <div class="about">
                <Reveal as="article" class="tt-board about-card" :y="18" :duration="700">
                    <p class="about-text">
                        У нас вы всегда будете в курсе актуальных новостей и событий в нашей индустрии.
                        Мы предлагаем вам возможность вступить в наше уникальное комьюнити, где вы найдёте
                        не только возможности для взаимодействия, но и погружение в мир эффективности
                        и профессионального роста.
                    </p>
                    <div class="facts">
                        <div class="fact">
                            <span class="tt-icon-tile tt-icon-tile--solid fact-icon"><i class="fa-solid fa-newspaper"></i></span>
                            <span>Актуальные новости и события индустрии</span>
                        </div>
                        <div class="fact">
                            <span class="tt-icon-tile tt-icon-tile--solid fact-icon"><i class="fa-solid fa-people-group"></i></span>
                            <span>Комьюнити для взаимодействия и роста</span>
                        </div>
                    </div>
                </Reveal>

                <Reveal as="aside" class="tt-dark about-aside" :y="22" :duration="760" :delay="80">
                    <span class="aside-chip">Тренерство</span>
                    <h3 class="aside-title">
                        <FlipWords :words="['Эффективно', 'Легко', 'Удобно']" :interval="2600" />
                    </h3>
                    <!-- Тренер отмечает пункты плана — своя иллюстрация вместо стокового фото -->
                    <div class="aside-art">
                        <SportArt name="clipboard" />
                    </div>
                </Reveal>
            </div>
        </section>

        <!-- Преимущества -->
        <section class="tt-container" aria-labelledby="advantages-title">
            <SectionHead eyebrow="Преимущества" title-id="advantages-title">
                В чём <span class="tt-accent">преимущество?</span>
            </SectionHead>
            <FeatureCards :items="advantages" :columns="2" />
        </section>

        <!-- Расписание -->
        <section id="schedule-section" class="tt-container" aria-labelledby="schedule-title">
            <SectionHead eyebrow="Расписание" title-id="schedule-title"
                lead="Распорядок дня, питание и базовые упражнения — из этого складывается результат клиента.">
                Насколько оно <span class="tt-accent">важно для клиента?</span>
            </SectionHead>

            <ScheduleCards :routine="routine" />

            <Reveal class="quote" variant="wipe" :y="10" :delay="80">
                <i class="fa-solid fa-quote-left quote-mark" aria-hidden="true"></i>
                <p>Определите свои приоритеты, учтите свою энергетику, включите перерывы.</p>
            </Reveal>
        </section>

        <CtaSection title="Ведите клиентов в Training Territory"
            text="Расписание, программы тренировок и прогресс клиентов — в одном кабинете. Создайте аккаунт тренера и начните работу."
            @register="$emit('open-register-modal')"
            @login="$emit('open-login-modal')" />

        <BadgeConnectors />
    </main>
</template>

<script>
import Reveal from '@/components/ui/Reveal.vue';
import FlipWords from '@/components/flip/FlipWords.vue';
import SportArt from '@/components/ui/SportArt.vue';
import HomeHero from '@/components/home/HomeHero.vue';
import HomeStats from '@/components/home/HomeStats.vue';
import SectionHead from '@/components/ui/SectionHead.vue';
import FeatureCards from '@/components/home/FeatureCards.vue';
import ScheduleCards from '@/components/home/ScheduleCards.vue';
import CtaSection from '@/components/home/CtaSection.vue';
import BadgeConnectors from '@/components/home/BadgeConnectors.vue';

export default {
    name: 'TrainFlip',
    components: {
        Reveal,
        FlipWords,
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
                { icon: 'fa-solid fa-calendar-check', lead: 'Расписание без накладок — ', accent: 'проверка пересечений' },
                { icon: 'fa-solid fa-list-check', lead: 'Программы из ', accent: 'справочника упражнений' },
                { icon: 'fa-solid fa-chart-line', lead: 'Прогресс клиентов ', accent: 'в одном месте' }
            ],
            // Цифры — из устройства платформы: справочник упражнений
            // и генератор рациона (3 приёма пищи на 7 дней вперёд)
            stats: [
                { icon: 'fa-solid fa-dumbbell', value: 900, suffix: '+', label: 'упражнений в справочнике — собирайте из них программы тренировок' },
                { icon: 'fa-solid fa-calendar-week', value: 7, label: 'дней вперёд — на столько рацион клиента составляется автоматически' },
                { icon: 'fa-solid fa-utensils', value: 3, label: 'приёма пищи в день с учётом тренировок, пола и аллергий клиента' }
            ],
            advantages: [
                {
                    icon: 'fa-solid fa-clipboard-list',
                    title: 'Своё расписание',
                    text: 'Строй своё рабочее расписание, определяй время работы с клиентами, перерывы, тренировки и другие задачи.'
                },
                {
                    icon: 'fa-solid fa-calendar-check',
                    title: 'Контроль задач',
                    text: 'Записывай и отслеживай свои задачи, а также отмечай их выполнение.'
                },
                {
                    icon: 'fa-solid fa-sitemap',
                    title: 'Понятная платформа',
                    text: 'Training Territory представляет собой чёткую и интуитивно понятную платформу.'
                },
                {
                    icon: 'fa-solid fa-file-invoice-dollar',
                    title: 'Своя цена тренировки',
                    text: 'Мы предоставляем тренерам возможность задавать свою цену за тренировку.'
                }
            ],
            routine: [
                { time: '7:00', text: 'Пробуждение' },
                { time: '8:00–8:30', text: 'Завтрак (каша с фруктами)' },
                { time: '10:00–12:00', text: 'Тренировка в фитнес-центре' },
                { time: '12:30–13:00', text: 'Полдник (орехи и ягоды)' },
                { time: '13:00–14:00', text: 'Обед (курица гриль с овощами)' },
                { time: '19:00–20:00', text: 'Ужин (рыба с овощами и гречкой)' },
                { time: '22:00', text: 'Ложиться спать' }
            ]
        };
    }
};
</script>

<style scoped>
/* ---------- «Тренерство»: белая карточка + тёмная колонка с фото ---------- */

.about {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
    align-items: stretch;
    gap: 24px;
}

/* Панель — .tt-board, только просторнее */
.about-card {
    padding: 40px;
}

.about-text {
    margin: 0;
    color: var(--tt-soft);
    font-size: 17px;
    line-height: 1.75;
}

.facts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-top: 32px;
}

.fact {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px;
    border: 1px solid var(--tt-line-brand);
    border-radius: var(--tt-radius-lg);
    background-color: var(--tt-brand-50);
    color: var(--tt-brand-deep);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
}

.fact:hover {
    box-shadow: var(--tt-shadow-hover);
    transform: translateY(-3px);
}

/* Залитая плашка .tt-icon-tile, чуть меньше стандартной */
.fact-icon {
    width: 42px;
    height: 42px;
    font-size: 16px;
}

/* Тёмная колонка — .tt-dark: глубокий синий, дополнительный цвет палитры */
.about-aside {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 32px;
}

.aside-chip {
    align-self: flex-start;
    padding: 4px 12px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: var(--tt-radius-pill);
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.88);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

/* min-height: пока слово сменяется (out-in), строка пуста — без него
   заголовок схлопывался бы и фото под ним подпрыгивало */
.aside-title {
    min-height: 1.15em;
    margin: 0;
    color: #ff8a4c;
    font-size: 32px;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.02em;
}

/* Фото заполняет остаток колонки, но высоту ей не диктует: иначе вертикальный
   кадр растягивал бы всю секцию */
/* Плитка с иллюстрацией: оранжевые линии на тёмно-синем, акценты голубые */
.aside-art {
    --art-line: #ff7a3d;
    --art-detail: rgba(255, 255, 255, 0.42);
    --art-accent: #8fa8ff;
    position: relative;
    flex: 1 1 0;
    min-height: 240px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: var(--tt-radius-lg);
    background:
        radial-gradient(circle at 50% 52%, rgba(248, 80, 10, 0.2) 0%, rgba(248, 80, 10, 0) 60%),
        rgba(255, 255, 255, 0.03);
}

.aside-art .sport-art {
    position: absolute;
    inset: 16px;
    width: calc(100% - 32px);
    height: calc(100% - 32px);
    transition: transform 0.6s var(--tt-ease);
}

.about-aside:hover .aside-art .sport-art {
    transform: scale(1.04);
}

/* ---------- цитата под карточками расписания ---------- */

.quote {
    position: relative;
    margin-top: 32px;
    padding: 28px 32px 28px 84px;
    border-radius: var(--tt-radius-lg);
    background:
        radial-gradient(120% 140% at 0% 0%, rgba(248, 80, 10, 0.12) 0%, transparent 55%),
        var(--tt-brand-50);
}

.quote-mark {
    position: absolute;
    top: 26px;
    left: 32px;
    color: var(--tt-brand);
    font-size: 28px;
}

.quote p {
    margin: 0;
    color: var(--tt-ink);
    font-size: 22px;
    font-weight: 600;
    line-height: 1.45;
    letter-spacing: -0.01em;
}

@media (max-width: 1024px) {
    .about {
        grid-template-columns: minmax(0, 1fr);
    }
}

@media (max-width: 640px) {

    .about-card,
    .about-aside {
        padding: 24px;
    }

    .facts {
        grid-template-columns: minmax(0, 1fr);
    }

    .about-text {
        font-size: 15px;
    }

    .quote {
        padding: 22px 22px 22px 64px;
    }

    .quote-mark {
        top: 22px;
        left: 22px;
        font-size: 22px;
    }

    .quote p {
        font-size: 17px;
    }
}

@media (prefers-reduced-motion: reduce) {

    .fact,
    .aside-art .sport-art {
        transition: none;
    }

    .fact:hover,
    .about-aside:hover .aside-art .sport-art {
        transform: none;
    }
}
</style>
