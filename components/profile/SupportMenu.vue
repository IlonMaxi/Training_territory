<template>
    <div class="support">
        <!-- Частые вопросы -->
        <section class="tt-board faq" aria-labelledby="faq-title">
            <h3 id="faq-title" class="tt-col-title">
                <span class="tt-col-icon"><i class="fa-solid fa-circle-question"></i></span>
                Частые вопросы
            </h3>
            <div class="faq-list">
                <div v-for="(item, index) in faqItems" :key="item.question" :class="['tt-tile', 'faq-item', { open: opened === index }]">
                    <button :id="`faq-q-${index}`" type="button" class="faq-question"
                        :aria-expanded="opened === index ? 'true' : 'false'" :aria-controls="`faq-a-${index}`"
                        @click="toggle(index)">
                        <span>{{ item.question }}</span>
                        <span class="faq-toggle" aria-hidden="true"><i class="fa-solid fa-plus"></i></span>
                    </button>
                    <!-- Высота раскрывается плавно: строка сетки растёт от 0fr до 1fr -->
                    <div :id="`faq-a-${index}`" class="faq-answer" role="region" :aria-labelledby="`faq-q-${index}`">
                        <div class="faq-answer-inner">
                            <p>{{ item.answer }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <button type="button" class="ask" @click="aiChat.open()">
                <i class="fa-solid fa-compass"></i>
                Не нашли ответ? Спросите помощника
                <span class="tt-arrow" aria-hidden="true">→</span>
            </button>
        </section>

        <!-- Контакты -->
        <aside class="contacts">
            <a href="mailto:primer.ru" class="tt-card tt-card--lift contact">
                <span class="tt-icon-tile"><i class="fa-solid fa-envelope"></i></span>
                <span class="contact-text">
                    <small>Остались вопросы? Напишите</small>
                    <b>primer.ru</b>
                </span>
                <i class="fa-solid fa-arrow-right contact-arrow" aria-hidden="true"></i>
            </a>

            <a href="tel:+78008008080" class="tt-card tt-card--lift contact">
                <span class="tt-icon-tile"><i class="fa-solid fa-phone"></i></span>
                <span class="contact-text">
                    <small>Горячая линия фитнес-центра</small>
                    <b>+7-800-800-80-80</b>
                </span>
                <i class="fa-solid fa-arrow-right contact-arrow" aria-hidden="true"></i>
            </a>

            <div class="hours">
                <div class="hours-head">
                    <span class="tt-col-title hours-title">
                        <span class="tt-col-icon tt-col-icon--blue"><i class="fa-regular fa-clock"></i></span>
                        График работы
                    </span>
                    <span :class="['now', { 'now--closed': !openNow.open }]">
                        <span class="now-dot"></span>{{ openNow.label }}
                    </span>
                </div>
                <ul class="hours-list">
                    <li v-for="day in hours" :key="day.name" :class="{ today: day.today, off: !day.from }">
                        <span>{{ day.name }}</span>
                        <span>{{ day.from ? `${day.from} – ${day.to}` : 'выходной' }}</span>
                    </li>
                </ul>
            </div>
        </aside>
    </div>
</template>

<script>
import aiChat from '@/components/utils/AiChatState.js';

// Часы работы: индекс — день недели из getDay() (0 — воскресенье)
const SCHEDULE = [
    { name: 'Воскресенье', from: null, to: null },
    { name: 'Понедельник', from: '09:00', to: '18:00' },
    { name: 'Вторник', from: '09:00', to: '18:00' },
    { name: 'Среда', from: '09:00', to: '18:00' },
    { name: 'Четверг', from: '09:00', to: '18:00' },
    { name: 'Пятница', from: '09:00', to: '18:00' },
    { name: 'Суббота', from: '10:00', to: '16:00' }
];

const CLIENT_FAQ = [
    {
        question: 'Как выбрать или сменить тренера?',
        answer: 'Откройте «Профиль» → «Мой тренер» и нажмите «Выбрать» у нужного тренера. Сменить тренера можно там же — уже назначенные тренировки останутся в расписании.'
    },
    {
        question: 'Где смотреть расписание и рацион?',
        answer: 'На главной странице кабинета, в блоке «План на неделю». Выберите день — появятся тренировки и питание на него. В режиме «Неделя» видно всё сразу.'
    },
    {
        question: 'Как внести замеры и увидеть прогресс?',
        answer: 'Замеры вносятся на главной странице кабинета, в блоке «Внесите замеры». Графики и изменения в процентах — в «Профиле», раздел «Мой прогресс».'
    },
    {
        question: 'Как оформить подписку?',
        answer: '«Профиль» → «Подписка»: выберите тариф, отсканируйте QR-код в приложении банка и подтвердите оплату. Остаток тренировок по подписке виден там же.'
    },
    {
        question: 'У меня травма или аллергия — что делать?',
        answer: 'Укажите их в «Настройках», блок «Здоровье». Помощник уберёт опасные упражнения из рекомендаций, а блюда с аллергеном — из плана питания.'
    }
];

const COACH_FAQ = [
    {
        question: 'Как назначить тренировку клиенту?',
        answer: 'На главной странице кабинета, блок «Назначить тренировку»: выберите клиента, программу и время. Если занятие пересекается с другим, это будет видно сразу.'
    },
    {
        question: 'Как отменить занятие?',
        answer: 'В расписании нажмите «Отменить» на карточке занятия и подтвердите. Занятие пропадёт из расписания у вас и у клиента.'
    },
    {
        question: 'Где посмотреть прогресс клиента?',
        answer: '«Профиль» → «Мои клиенты»: нажмите «Прогресс» на карточке клиента — появятся изменения его показателей с первого замера.'
    },
    {
        question: 'Как изменить специализацию и опыт?',
        answer: 'В «Настройках» профиля. Эти данные видят клиенты, когда выбирают тренера.'
    }
];

const COMMON_FAQ = [
    {
        question: 'Как пользоваться помощником?',
        answer: 'Нажмите «Помощник» в шапке и напишите своими словами, что нужно: «прогресс в процентах», «когда тренировка», «написать тренеру». Он откроет нужный раздел.'
    }
];

const toMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

export default {
    name: 'SupportMenu',
    props: {
        user: { type: Object, default: null }
    },
    data() {
        return {
            aiChat,
            opened: 0,
            now: new Date()
        };
    },
    computed: {
        faqItems() {
            const own = this.user && this.user.coachid ? COACH_FAQ : CLIENT_FAQ;
            return [...own, ...COMMON_FAQ];
        },
        hours() {
            const today = this.now.getDay();
            // Неделя в списке — с понедельника
            return [1, 2, 3, 4, 5, 6, 0].map(index => ({ ...SCHEDULE[index], today: index === today }));
        },
        // «Сейчас открыто · до 18:00» или когда откроется
        openNow() {
            const day = SCHEDULE[this.now.getDay()];
            const minutes = this.now.getHours() * 60 + this.now.getMinutes();
            if (day.from && minutes >= toMinutes(day.from) && minutes < toMinutes(day.to)) {
                return { open: true, label: `Открыто до ${day.to}` };
            }
            if (day.from && minutes < toMinutes(day.from)) {
                return { open: false, label: `Откроется сегодня в ${day.from}` };
            }
            for (let shift = 1; shift <= 7; shift += 1) {
                const next = SCHEDULE[(this.now.getDay() + shift) % 7];
                if (next.from) {
                    const when = shift === 1 ? 'завтра' : next.name.toLowerCase().replace(/а$/, 'у');
                    return { open: false, label: `Откроется ${shift === 1 ? '' : 'в '}${when} в ${next.from}` };
                }
            }
            return { open: false, label: 'Закрыто' };
        }
    },
    mounted() {
        // Статус «открыто / закрыто» обновляем раз в минуту
        this.clock = setInterval(() => { this.now = new Date(); }, 60000);
    },
    beforeDestroy() {
        clearInterval(this.clock);
    },
    methods: {
        toggle(index) {
            this.opened = this.opened === index ? null : index;
        }
    }
};
</script>

<style scoped>
.support {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr);
    align-items: start;
    gap: 20px;
}

/* ---------- вопросы ---------- */

.faq {
    display: grid;
    gap: 18px;
}

.faq-list {
    display: grid;
    gap: 8px;
}

/* Вопрос — плитка .tt-tile; раскрытый становится белой карточкой */
.faq-item {
    transition: border-color 0.25s ease, background-color 0.25s ease;
}

.faq-item:hover {
    border-color: var(--tt-line-brand);
}

.faq-item.open {
    border-color: var(--tt-line-brand);
    background-color: var(--tt-surface);
    box-shadow: var(--tt-shadow-card);
}

.faq-question {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    width: 100%;
    margin: 0;
    padding: 16px 16px 16px 18px;
    border: 0;
    background: transparent;
    color: var(--tt-ink);
    font-size: 15px;
    font-weight: 600;
    line-height: 1.4;
    text-align: left;
    cursor: pointer;
}

/* Рамка фокуса — общая; скругление, чтобы она шла по краю плитки */
.faq-question {
    border-radius: var(--tt-radius-md);
}

.faq-toggle {
    display: grid;
    flex: none;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--tt-brand-tint);
    color: var(--tt-brand);
    font-size: 13px;
    transition: transform 0.4s var(--tt-ease), background-color 0.25s ease, color 0.25s ease;
}

.faq-item.open .faq-toggle {
    background-color: var(--tt-brand);
    color: #ffffff;
    transform: rotate(135deg);
}

.faq-answer {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.4s var(--tt-ease);
}

.faq-item.open .faq-answer {
    grid-template-rows: 1fr;
}

.faq-answer-inner {
    min-height: 0;
    overflow: hidden;
}

.faq-answer p {
    margin: 0;
    padding: 0 18px 16px;
    color: var(--tt-soft);
    font-size: 15px;
    line-height: 1.6;
}

.ask {
    --tt-focus-ring: rgba(55, 96, 231, 0.4);
    display: inline-flex;
    align-items: center;
    justify-self: start;
    gap: 10px;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--tt-blue-deep);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
}

.ask .tt-arrow {
    transition: transform 0.3s var(--tt-ease);
}

.ask:hover .tt-arrow {
    transform: translateX(4px);
}

/* ---------- контакты ---------- */

.contacts {
    display: grid;
    gap: 12px;
}

/* Карточка — .tt-card: рамка, подъём и заливка иконки при наведении */
.contact {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px;
    color: var(--tt-ink);
    text-decoration: none;
}

.contact-text {
    display: grid;
    flex: 1 1 auto;
    gap: 2px;
    min-width: 0;
}

.contact-text small {
    color: var(--tt-muted);
    font-size: 13px;
}

.contact-text b {
    font-size: 18px;
    letter-spacing: -0.01em;
}

.contact-arrow {
    color: var(--tt-muted);
    font-size: 13px;
    transition: transform 0.3s var(--tt-ease), color 0.3s ease;
}

.contact:hover .contact-arrow {
    color: var(--tt-brand);
    transform: translateX(3px);
}

.hours {
    display: grid;
    gap: 14px;
    padding: 20px;
    border: 1px solid var(--tt-line);
    border-radius: var(--tt-radius-lg);
    background-color: var(--tt-surface);
}

.hours-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.hours-title {
    font-size: 16px;
}

.now {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    border-radius: var(--tt-radius-pill);
    background-color: rgba(15, 159, 110, 0.1);
    color: #0b7a55;
    font-size: 12px;
    font-weight: 700;
}

.now-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: currentColor;
    animation: now-pulse 1.8s ease-in-out infinite;
}

@keyframes now-pulse {
    50% {
        opacity: 0.35;
    }
}

.now--closed {
    background-color: rgba(15, 20, 39, 0.06);
    color: var(--tt-muted);
}

.now--closed .now-dot {
    animation: none;
}

body.dark-theme .now:not(.now--closed) {
    color: #6ee7b7;
}

.hours-list {
    display: grid;
    gap: 2px;
    margin: 0;
    padding: 0;
    list-style: none;
}

.hours-list li {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 12px;
    border-radius: var(--tt-radius-sm);
    color: var(--tt-soft);
    font-size: 14px;
    font-variant-numeric: tabular-nums;
}

.hours-list li.off {
    color: var(--tt-muted);
}

/* Сегодняшний день — синим, как «сегодня» в расписании */
.hours-list li.today {
    background-color: var(--tt-blue-tint);
    color: var(--tt-blue-deep);
    font-weight: 700;
}

@media (max-width: 1100px) {
    .support {
        grid-template-columns: minmax(0, 1fr);
    }
}

@media (prefers-reduced-motion: reduce) {

    .faq-answer,
    .faq-toggle,
    .contact-arrow {
        transition: none;
    }

    .contact:hover .contact-arrow {
        transform: none;
    }

    .now-dot {
        animation: none;
    }
}
</style>
