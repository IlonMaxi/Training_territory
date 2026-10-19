<template>
    <aside :class="['ai-panel', { open: chat.isOpen, thinking: pending }]" aria-label="Помощник по навигации">
        <header class="ai-header">
            <span class="tt-icon-tile tt-icon-tile--solid ai-avatar" aria-hidden="true"><i class="fa-solid fa-compass"></i></span>
            <div class="ai-heading">
                <span class="ai-name">Помощник</span>
                <span class="ai-status">
                    <span class="ai-dot"></span>{{ pending ? 'Думаю…' : 'Подскажу, где что находится' }}
                </span>
            </div>
            <button v-if="chat.messages.length" type="button" class="tt-icon-btn ai-icon-btn" title="Начать заново"
                aria-label="Начать заново" @click="reset">
                <i class="fa-solid fa-rotate-left"></i>
            </button>
            <button type="button" class="tt-icon-btn ai-icon-btn ai-close" aria-label="Закрыть помощника" @click="chat.close()">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </header>

        <div ref="messages" class="ai-messages" aria-live="polite">
            <!-- Приветствие, пока разговор не начат -->
            <div v-if="!chat.messages.length" class="ai-welcome">
                <svg class="ai-compass" viewBox="0 0 120 120" aria-hidden="true">
                    <circle class="c-ring" cx="60" cy="60" r="54" />
                    <g class="c-ticks">
                        <line v-for="tick in ticks" :key="tick.key" :x1="tick.x1" :y1="tick.y1" :x2="tick.x2"
                            :y2="tick.y2" :class="['c-tick', { 'c-tick--major': tick.major }]" />
                    </g>
                    <circle class="c-ring c-ring--dash" cx="60" cy="60" r="36" />
                    <g class="c-needle">
                        <path class="c-needle-n" d="M60 22 L67.5 60 L52.5 60 Z" />
                        <path class="c-needle-s" d="M60 98 L67.5 60 L52.5 60 Z" />
                    </g>
                    <circle class="c-hub" cx="60" cy="60" r="5" />
                </svg>
                <h3 class="ai-welcome-title">Куда вам нужно?</h3>
                <p class="ai-welcome-text">
                    Напишите своими словами — открою нужный раздел или покажу пример тренировки.
                </p>
                <div class="ai-hints">
                    <button v-for="(hint, index) in hints" :key="hint.text" type="button" class="tt-card tt-card--lift ai-hint"
                        :style="{ '--i': index }" @click="ask(hint.text)">
                        <span class="tt-icon-tile tt-icon-tile--sm"><i :class="hint.icon"></i></span>
                        <span class="ai-hint-text">{{ hint.text }}</span>
                        <i class="fa-solid fa-arrow-right ai-hint-arrow" aria-hidden="true"></i>
                    </button>
                </div>
            </div>

            <div v-for="message in chat.messages" :key="message.id" :class="['ai-message', message.author]">
                <span v-if="message.author === 'bot'" class="tt-icon-tile tt-icon-tile--xs ai-mini" aria-hidden="true">
                    <i class="fa-solid fa-compass"></i>
                </span>
                <div class="ai-message-body">
                    <div :class="['tt-bubble', { 'tt-bubble--mine': message.author === 'user' }]">{{ message.text }}</div>

                    <div v-if="message.choices" class="ai-choices">
                        <button v-for="choice in message.choices" :key="choice.key" type="button" class="ai-choice"
                            @click="pick(choice)">
                            {{ choice.label }}
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="pending" class="ai-message bot">
                <span class="tt-icon-tile tt-icon-tile--xs ai-mini" aria-hidden="true"><i class="fa-solid fa-compass"></i></span>
                <div class="tt-bubble ai-typing" aria-label="Помощник печатает">
                    <span class="tt-dots"><span></span><span></span><span></span></span>
                </div>
            </div>
        </div>

        <form class="ai-input" @submit.prevent="submit">
            <div class="tt-composer">
                <input ref="input" v-model="draft" type="text" placeholder="Напишите, что вам нужно…" :disabled="pending"
                    aria-label="Запрос помощнику" />
                <button type="submit" class="tt-send" :disabled="pending || !draft.trim()" aria-label="Отправить">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
            <p class="ai-note">Открываю разделы и подбираю тренировки</p>
        </form>
    </aside>
</template>

<script>
import aiChat from '@/components/utils/AiChatState.js';

// Маршруты знает фронтенд, а не ML-сервис: только здесь известны реальные
// пути страниц и роль вошедшего — у тренера и клиента расписание разное.
const DESTINATIONS = {
    progress: {
        label: 'Прогресс и замеры',
        route: () => ({ path: '/Profile', query: { menu: 'progress' } })
    },
    trainer: {
        label: 'Мой тренер',
        route: () => ({ path: '/Profile', query: { menu: 'trainer' } })
    },
    settings: {
        label: 'Настройки профиля',
        route: () => ({ path: '/Profile', query: { menu: 'settings' } })
    },
    subscription: {
        label: 'Подписка и оплата',
        route: () => ({ path: '/Profile', query: { menu: 'subscription' } })
    },
    chat: {
        label: 'Чат с тренером',
        route: () => ({ path: '/Profile', query: { menu: 'chat' } })
    },
    support: {
        label: 'Поддержка',
        route: () => ({ path: '/Profile', query: { menu: 'support' } })
    },
    feedback: {
        label: 'Оставить отзыв',
        route: () => ({ path: '/Profile', query: { menu: 'feedback' } })
    },
    clients: {
        label: 'Мои клиенты',
        roles: ['trainer'],
        route: () => ({ path: '/Profile', query: { menu: 'clients' } })
    },
    schedule: {
        label: 'Расписание',
        route: (role) => role === 'trainer'
            ? { path: '/TrainerPage', hash: '#schedule' }
            : { path: '/ClientPage', hash: '#schedule' }
    },
    nutrition: {
        label: 'Питание',
        roles: ['client'],
        route: () => ({ path: '/ClientPage', hash: '#nutrition' })
    }
};

// Намерение «тренировка» никуда не ведёт: персональной программы у нас нет,
// поэтому помощник отвечает прямо в чате готовыми примерами
const WORKOUT_INTENT = 'workout';
const WORKOUT_LABEL = 'Примеры тренировок';

export default {
    name: 'AiNavigator',
    data() {
        // Деления на ободке компаса в приветствии
        const ticks = Array.from({ length: 24 }, (_, index) => {
            const angle = (index * 15 - 90) * Math.PI / 180;
            const major = index % 6 === 0;
            const point = (radius) => [
                Math.round((60 + radius * Math.cos(angle)) * 10) / 10,
                Math.round((60 + radius * Math.sin(angle)) * 10) / 10
            ];
            const [x1, y1] = point(major ? 42 : 45);
            const [x2, y2] = point(49);
            return { key: index, major, x1, y1, x2, y2 };
        });
        return {
            ticks,
            chat: aiChat,
            draft: '',
            pending: false,
            // Программы, показанные последним ответом: по ним ищем выбранную кнопку
            programs: [],
            healthNoticeShown: false,
            hints: [
                { text: 'Нужен прогресс в процентах', icon: 'fa-solid fa-chart-line' },
                { text: 'Когда следующая тренировка', icon: 'fa-solid fa-calendar-days' },
                { text: 'Хочу потренироваться', icon: 'fa-solid fa-dumbbell' },
                { text: 'Написать тренеру', icon: 'fa-solid fa-comments' }
            ]
        };
    },
    watch: {
        'chat.messages.length'() {
            this.scrollToBottom();
        },
        'chat.isOpen'(open) {
            // Фокус в поле — после выезда панели, иначе браузер дёрнет прокрутку
            if (open) setTimeout(() => this.$refs.input && this.$refs.input.focus(), 350);
        }
    },
    methods: {
        cookie(name) {
            if (typeof document === 'undefined') return null;
            const row = document.cookie.split('; ').find(c => c.startsWith(name + '='));
            return row ? decodeURIComponent(row.split('=')[1]) : null;
        },

        accountType() {
            return this.cookie('accountType');
        },

        clientId() {
            try {
                const raw = this.cookie('user');
                return raw ? JSON.parse(raw).clientid || null : null;
            } catch (error) {
                return null;
            }
        },

        label(intent) {
            if (intent === WORKOUT_INTENT) return WORKOUT_LABEL;
            return DESTINATIONS[intent] ? DESTINATIONS[intent].label : null;
        },

        available(intent) {
            if (intent === WORKOUT_INTENT) return true;
            const dest = DESTINATIONS[intent];
            if (!dest) return false;
            if (!dest.roles) return true;
            return dest.roles.includes(this.accountType() || 'client');
        },

        // Начать разговор заново: история и показанные программы забываются
        reset() {
            this.chat.reset();
            this.programs = [];
            this.healthNoticeShown = false;
            this.$nextTick(() => this.$refs.input && this.$refs.input.focus());
        },

        submit() {
            const text = this.draft.trim();
            if (!text) return;
            this.draft = '';
            this.ask(text);
        },

        async ask(text) {
            this.chat.addMessage('user', text);
            this.pending = true;

            try {
                const response = await fetch('/api/ml/intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });

                if (response.status === 401) {
                    this.chat.addMessage('bot', 'Сначала нужно войти — тогда я смогу открывать разделы профиля.');
                    return;
                }

                // 502 отдаёт наш прокси, когда не достучался до ML-сервиса.
                // Называем причину прямо — иначе «недоступен» ничего не говорит
                // ни пользователю, ни разработчику.
                if (response.status === 502) {
                    this.chat.addMessage('bot', 'Не отвечает сервис распознавания запросов. Он стартует вместе с сайтом '
                        + '(npm run dev) — проверьте строки [ml] в терминале, или запустите его отдельно: npm run ml');
                    return;
                }

                if (!response.ok) {
                    this.chat.addMessage('bot', 'Помощник сейчас недоступен. Попробуйте чуть позже.');
                    return;
                }

                const data = await response.json();
                await this.handleIntent(data, text);
            } catch (error) {
                console.error('Ошибка запроса к помощнику:', error);
                this.chat.addMessage('bot', 'Не получилось связаться с помощником. Проверьте соединение.');
            } finally {
                this.pending = false;
            }
        },

        async handleIntent(data, query) {
            if (data.intent === WORKOUT_INTENT) {
                // query — текст с исправленными опечатками из ML-сервиса
                await this.handleWorkout(data.query || query);
                return;
            }

            if (data.intent !== 'unknown' && this.available(data.intent)) {
                this.chat.addMessage('bot', `Открываю: ${this.label(data.intent)}`);
                this.goTo(data.intent);
                return;
            }

            /*
              Классификатор не уверен — прежде чем переспрашивать, спросим базу.
              Названия мышц и упражнений в обучающих фразах не перечислены, но
              они есть в описаниях программ, которые ведёт тренер. Так «тренировка
              на широчайшие» находит «Спину», хотя модель этого слова не знает,
              и новая программа становится доступной сразу после добавления
              в админку — без правки обучающих фраз.
            */
            const fromDatabase = await this.loadPrograms(data.query || query);
            if (fromDatabase && fromDatabase.matched) {
                await this.showPrograms(fromDatabase);
                return;
            }

            // Не уверены — не отвечаем «не понял», а предлагаем ближайшие разделы
            const choices = (data.alternatives || [])
                .filter(alt => this.available(alt.intent))
                .slice(0, 3)
                .map(alt => ({
                    key: alt.intent,
                    label: this.label(alt.intent),
                    action: alt.intent === WORKOUT_INTENT ? 'workouts' : 'navigate'
                }));

            if (choices.length) {
                this.chat.addMessage('bot', 'Не уверен, что вы имели в виду. Может, сюда?', { choices });
            } else {
                this.chat.addMessage('bot', 'Такого раздела у нас нет. Спросите про расписание, питание, прогресс, тренировки, подписку или тренера.');
            }
        },

        // Персональной программы нет: своей модели рекомендаций мы не обучали,
        // поэтому честно говорим почему и показываем то, что завёл тренер
        async handleWorkout(query) {
            const found = await this.loadPrograms(query);

            if (!found) {
                this.chat.addMessage('bot', 'Не получилось загрузить программы тренировок.');
                return;
            }

            await this.showPrograms(found);
        },

        // Молча прятать программы нельзя: человек должен понимать, почему
        // ему не показали то, что он просил. Но повторять это перед каждым
        // ответом незачем — говорим один раз за разговор.
        healthNotice(health) {
            if (this.healthNoticeShown) return null;
            if (!health || !health.injuries || !health.injuries.length) return null;

            this.healthNoticeShown = true;

            const areas = health.injuries.map(item => item.value).join(', ');
            const lines = [`Учитываю ваши ограничения: ${areas}.`];

            if (health.excluded && health.excluded.length) {
                lines.push(`Не предлагаю: ${health.excluded.join(', ')} — там всё на больное место.`);
            }
            if (health.trimmed && health.trimmed.length) {
                const list = health.trimmed.map(t => `${t.name} (−${t.removed})`).join(', ');
                lines.push(`Убрал опасные упражнения: ${list}.`);
            }

            return lines.join('\n');
        },

        async showPrograms(found) {
            const notice = this.healthNotice(found.health);
            if (notice) this.chat.addMessage('bot', notice);

            if (!found.programs.length) {
                const blocked = found.health && found.health.excluded && found.health.excluded.length;
                this.chat.addMessage('bot', blocked
                    ? 'Безопасных программ под ваши ограничения не осталось. Обсудите нагрузку с тренером.'
                    : 'Программ тренировок пока нет — их добавляет тренер в админ-панели.');
                return;
            }

            // Группа названа прямо в запросе и нашлась одна программа —
            // показываем сразу, переспрашивать незачем
            if (found.matched && found.programs.length === 1) {
                this.chat.addMessage('bot', this.formatProgram(found.programs[0]));
                return;
            }

            this.programs = found.programs;
            this.chat.addMessage('bot', await this.workoutIntro(found.matched), {
                choices: found.programs.map(program => ({
                    key: String(program.id),
                    label: program.name,
                    action: 'workout'
                }))
            });
        },

        async loadPrograms(query) {
            try {
                const url = '/api/workouts/programs' + (query ? `?q=${encodeURIComponent(query)}` : '');
                const response = await fetch(url);
                if (!response.ok) return null;
                return await response.json();
            } catch (error) {
                console.error('Не удалось загрузить программы тренировок:', error);
                return null;
            }
        },

        formatProgram(program) {
            const lines = program.exercises.map(
                (exercise, index) => `${index + 1}. ${exercise.name} — ${exercise.sets}×${exercise.reps}`
            );

            const head = [
                program.name,
                program.durationMinutes ? `${program.durationMinutes} минут` : null,
                program.difficulty
            ].filter(Boolean).join(' · ');

            const footer = program.removedExercises
                ? `Из программы убрано упражнений: ${program.removedExercises} — из-за ваших ограничений. Вес и объём согласуйте с тренером.`
                : 'Между подходами 60–90 секунд отдыха. Это общий пример — вес и объём согласуйте с тренером.';

            return [head, '', ...lines, '', footer].join('\n');
        },


        async workoutIntro(matched) {
            if (matched) {
                return 'Нашёл несколько подходящих программ. Какую показать?';
            }

            const clientId = this.clientId();
            if (!clientId) {
                return 'Персональную программу пока не составляю. Есть готовые — какую тренировку показать?';
            }

            try {
                const response = await fetch(`/api/clients/${clientId}/progress-summary`);
                if (response.status === 404) {
                    return 'Для персональной программы не хватает данных: нужны замеры и история тренировок. Пока покажу готовые — какую выбрать?';
                }
            } catch (error) {
                console.error('Не удалось проверить данные клиента:', error);
            }

            return 'Персональный подбор ещё не готов — он появится, когда наберётся история замеров. Пока есть готовые программы, какую показать?';
        },

        pick(choice) {
            if (choice.action === 'workout') {
                const program = this.programs.find(p => String(p.id) === choice.key);
                if (program) {
                    this.chat.addMessage('user', program.name);
                    this.chat.addMessage('bot', this.formatProgram(program));
                }
                return;
            }

            if (choice.action === 'workouts') {
                this.handleWorkout('');
                return;
            }

            this.goTo(choice.key);
        },

        goTo(intent) {
            const dest = DESTINATIONS[intent];
            if (!dest) return;

            const target = dest.route(this.accountType());

            // Nuxt подменяет router.push своей обёрткой, которая не возвращает
            // промис, поэтому .catch() вешаем только если он вообще есть.
            // Сам catch нужен, чтобы переход на текущий же маршрут
            // (NavigationDuplicated) не считался ошибкой.
            const navigation = this.$router.push(target);
            if (navigation && typeof navigation.catch === 'function') {
                navigation.catch(() => { });
            }
        },

        scrollToBottom() {
            this.$nextTick(() => {
                const box = this.$refs.messages;
                if (box) box.scrollTop = box.scrollHeight;
            });
        }
    }
};
</script>

<style scoped>
.ai-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    /* Выше шапки сайта (1500) и затемнения (1550) */
    z-index: 1600;
    display: flex;
    flex-direction: column;
    width: var(--ai-chat-width);
    max-width: 100%;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    border-left: 1px solid var(--tt-line-brand);
    background-color: var(--tt-surface);
    box-shadow: -24px 0 60px rgba(15, 20, 39, 0.08);
    color: var(--tt-ink);
    /* Закрытая панель прячется целиком: её кнопки не ловят Tab за краем экрана */
    visibility: hidden;
    transform: translateX(100%);
    transition:
        transform 0.35s cubic-bezier(0.2, 0.7, 0.3, 1),
        visibility 0s linear 0.35s,
        background-color 0.5s ease;
}

.ai-panel.open {
    visibility: visible;
    transform: none;
    transition:
        transform 0.35s cubic-bezier(0.2, 0.7, 0.3, 1),
        visibility 0s,
        background-color 0.5s ease;
}

/* Мягкое свечение сверху — как подложка на страницах */
.ai-panel::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 320px;
    background:
        radial-gradient(circle at 90% 0%, rgba(248, 80, 10, 0.12), transparent 60%),
        radial-gradient(circle at 0% 30%, rgba(55, 96, 231, 0.07), transparent 55%);
    pointer-events: none;
}

/* ---------- шапка ---------- */

.ai-header {
    position: relative;
    display: flex;
    flex: none;
    align-items: center;
    gap: 12px;
    height: 80px;
    padding: 0 18px 0 20px;
    border-bottom: 1px solid var(--tt-line);
}

/* Аватар помощника — залитая плашка .tt-icon-tile, чуть меньше стандартной */
.ai-avatar {
    width: 44px;
    height: 44px;
    font-size: 19px;
}

/* Пока ждём ответа, стрелка компаса «ищет направление» */
.thinking .ai-avatar i,
.thinking .ai-mini i {
    animation: ai-seek 1.4s ease-in-out infinite;
}

@keyframes ai-seek {

    0%,
    100% {
        transform: rotate(0);
    }

    30% {
        transform: rotate(-35deg);
    }

    65% {
        transform: rotate(25deg);
    }
}

.ai-heading {
    display: grid;
    flex: 1 1 auto;
    gap: 2px;
    min-width: 0;
}

.ai-name {
    color: var(--tt-ink);
    font-size: 17px;
    font-weight: 700;
    line-height: 1.2;
}

.ai-status {
    display: flex;
    align-items: center;
    gap: 6px;
    overflow: hidden;
    color: var(--tt-muted);
    font-size: 13px;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.ai-dot {
    flex: none;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: #22c55e;
}

.thinking .ai-dot {
    background-color: var(--tt-brand);
    animation: ai-dot 1s ease-in-out infinite;
}

@keyframes ai-dot {
    50% {
        opacity: 0.3;
    }
}

/* Кнопки шапки — .tt-icon-btn, только поменьше; крестик поворачивается, как у окон */
.ai-icon-btn {
    width: 38px;
    height: 38px;
    font-size: 14px;
}

.ai-close:hover {
    border-color: transparent;
    background-color: var(--tt-brand);
    color: #ffffff;
    transform: rotate(90deg);
}

/* ---------- лента сообщений ---------- */

.ai-messages {
    position: relative;
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 14px;
    padding: 20px;
    overflow-y: auto;
    overscroll-behavior: contain;
}

.ai-message {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    max-width: 92%;
    animation: ai-in 0.4s var(--tt-ease) both;
}

.ai-message.user {
    align-self: flex-end;
    flex-direction: row-reverse;
}

/* Аватар бота — у начала ответа: под ответом бывают кнопки выбора */
.ai-message.bot {
    align-self: flex-start;
    align-items: flex-start;
}

@keyframes ai-in {
    from {
        opacity: 0;
        transform: translateY(10px) scale(0.98);
    }

    to {
        opacity: 1;
        transform: none;
    }
}

.ai-message-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
}

.ai-message.user .ai-message-body {
    align-items: flex-end;
}

/* Программа тренировки приходит списком строк — переносы держит .tt-bubble (pre-line) */
.ai-choices {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.ai-choice {
    min-height: 34px;
    margin: 0;
    padding: 6px 14px;
    border: 1px solid var(--tt-line-brand);
    border-radius: var(--tt-radius-pill);
    background-color: var(--tt-surface);
    color: var(--tt-brand-deep);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;
    text-align: left;
    cursor: pointer;
    transition:
        background-color 0.2s ease,
        border-color 0.2s ease,
        color 0.2s ease,
        transform 0.3s var(--tt-ease);
}

.ai-choice:hover {
    border-color: var(--tt-brand);
    background-color: var(--tt-brand);
    color: #ffffff;
    transform: translateY(-1px);
}

.ai-typing {
    display: flex;
    align-items: center;
    padding: 14px 16px;
}

/* ---------- приветствие ---------- */

.ai-welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin: auto 0;
    padding: 4px 0;
    text-align: center;
}

.ai-compass {
    width: 112px;
    height: 112px;
    margin-bottom: 4px;
}

.c-ring {
    fill: none;
    stroke: var(--tt-line-brand);
    stroke-width: 1.5;
}

.c-ring--dash {
    stroke: rgba(55, 96, 231, 0.35);
    stroke-dasharray: 2 5;
    transform-origin: 60px 60px;
    animation: c-spin 40s linear infinite;
}

.c-tick {
    stroke: var(--tt-brand);
    stroke-width: 1.5;
    stroke-linecap: round;
    opacity: 0.45;
}

.c-tick--major {
    stroke-width: 2.5;
    opacity: 1;
}

.c-needle {
    transform-origin: 60px 60px;
}

.c-needle-n {
    fill: var(--tt-brand);
}

.c-needle-s {
    fill: var(--tt-blue);
    opacity: 0.8;
}

.c-hub {
    fill: var(--tt-surface);
    stroke: var(--tt-ink);
    stroke-width: 2;
}

/* При каждом открытии стрелка «ищет» север, потом едва покачивается */
.open .c-needle {
    animation:
        c-find 1.6s var(--tt-ease) 0.2s both,
        c-sway 6s ease-in-out 1.8s infinite;
}

@keyframes c-find {
    0% {
        transform: rotate(-140deg);
    }

    45% {
        transform: rotate(28deg);
    }

    70% {
        transform: rotate(-12deg);
    }

    85% {
        transform: rotate(5deg);
    }

    100% {
        transform: rotate(0);
    }
}

@keyframes c-sway {

    0%,
    100% {
        transform: rotate(0);
    }

    50% {
        transform: rotate(6deg);
    }
}

@keyframes c-spin {
    to {
        transform: rotate(360deg);
    }
}

.ai-welcome-title {
    margin: 0;
    color: var(--tt-ink);
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.01em;
}

.ai-welcome-text {
    max-width: 290px;
    margin: 0 0 8px;
    color: var(--tt-soft);
    font-size: 14px;
    line-height: 1.55;
}

.ai-hints {
    display: grid;
    gap: 8px;
    width: 100%;
}

/* Подсказка — маленькая карточка (.tt-card): рамка, подъём и заливка иконки при наведении */
.ai-hint {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    margin: 0;
    padding: 10px 14px 10px 10px;
    border-radius: var(--tt-radius-md);
    color: var(--tt-ink);
    font-size: 14px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
}

/* backwards: после появления transform свободен для подъёма при наведении */
.open .ai-hint {
    animation: ai-in 0.45s var(--tt-ease) backwards;
    animation-delay: calc(var(--i, 0) * 60ms + 200ms);
}

.ai-hint-text {
    flex: 1 1 auto;
    min-width: 0;
}

.ai-hint-arrow {
    color: var(--tt-muted);
    font-size: 12px;
    transition: transform 0.3s var(--tt-ease), color 0.25s ease;
}

.ai-hint:hover .ai-hint-arrow {
    color: var(--tt-brand);
    transform: translateX(3px);
}

/* ---------- поле ввода ---------- */

.ai-input {
    position: relative;
    flex: none;
    padding: 14px 18px 16px;
    border-top: 1px solid var(--tt-line);
    background-color: var(--tt-surface);
}

.ai-note {
    margin: 8px 0 0;
    color: var(--tt-muted);
    font-size: 12px;
    text-align: center;
}

body.dark-theme .ai-panel {
    box-shadow: -24px 0 60px rgba(0, 0, 0, 0.45);
}

@media (max-width: 640px) {
    .ai-header {
        height: 68px;
        padding: 0 14px 0 16px;
    }

    .ai-messages {
        padding: 16px;
    }

    .ai-input {
        padding: 12px 14px 14px;
    }
}

@media (prefers-reduced-motion: reduce) {

    .ai-panel,
    .ai-panel.open {
        transition: none;
    }

    .ai-message,
    .open .ai-hint,
    .open .c-needle,
    .c-ring--dash,
    .thinking .ai-avatar i,
    .thinking .ai-mini i,
    .thinking .ai-dot {
        animation: none;
    }

    .ai-close:hover,
    .ai-choice:hover {
        transform: none;
    }
}
</style>
