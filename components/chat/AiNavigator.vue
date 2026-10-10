<template>
    <aside class="ai-panel" :class="{ open: chat.isOpen }" aria-label="Помощник по навигации">
        <header class="ai-header">
            <div class="ai-title">
                <i class="fa-solid fa-compass"></i>
                <span>Куда вам нужно?</span>
            </div>
            <button class="ai-close" @click="chat.close()" aria-label="Закрыть помощника">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </header>

        <div class="ai-messages" ref="messages">
            <div v-for="message in chat.messages" :key="message.id" class="ai-message" :class="message.author">
                <div class="ai-bubble">{{ message.text }}</div>

                <div v-if="message.choices" class="ai-choices">
                    <button v-for="choice in message.choices" :key="choice.key" class="ai-choice"
                        @click="pick(choice)">
                        {{ choice.label }}
                    </button>
                </div>
            </div>

            <div v-if="pending" class="ai-message bot">
                <div class="ai-bubble ai-typing"><span></span><span></span><span></span></div>
            </div>
        </div>

        <div v-if="!chat.messages.length" class="ai-hints">
            <p class="ai-hints-title">Например:</p>
            <button v-for="hint in hints" :key="hint" class="ai-hint" @click="ask(hint)">{{ hint }}</button>
        </div>

        <form class="ai-input" @submit.prevent="submit">
            <input v-model="draft" type="text" placeholder="Напишите, что вам нужно…" :disabled="pending"
                aria-label="Запрос помощнику" />
            <button type="submit" :disabled="pending || !draft.trim()" aria-label="Отправить">
                <i class="fa-solid fa-paper-plane"></i>
            </button>
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
        return {
            chat: aiChat,
            draft: '',
            pending: false,
            // Программы, показанные последним ответом: по ним ищем выбранную кнопку
            programs: [],
            healthNoticeShown: false,
            hints: [
                'Нужен прогресс в процентах',
                'Когда следующая тренировка',
                'Хочу потренироваться',
                'Написать тренеру'
            ]
        };
    },
    watch: {
        'chat.messages.length'() {
            this.scrollToBottom();
        },
        'chat.isOpen'(open) {
            if (open) this.$nextTick(() => this.$el.querySelector('input')?.focus());
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
                    this.chat.addMessage('bot', 'Не отвечает сервис распознавания запросов. Он запускается отдельно: npm run ml');
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
    z-index: 1200;
    display: flex;
    flex-direction: column;
    width: var(--ai-chat-width);
    max-width: 100%;
    height: 100vh;
    background-color: var(--background-color-white);
    border-left: 1px solid var(--button-border-color);
    transform: translateX(100%);
    transition: transform 0.35s cubic-bezier(0.2, 0.7, 0.3, 1);
}

.ai-panel.open {
    transform: translateX(0);
}

.ai-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 18px 20px;
    border-bottom: 1px solid var(--button-border-color);
}

.ai-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: var(--text-h6);
    font-weight: var(--weight-semibold);
    color: var(--text-color);
}

.ai-title i {
    color: var(--button-hover-color);
}

.ai-close {
    background: transparent;
    border: none;
    padding: 6px 10px;
    color: var(--text-color);
    cursor: pointer;
}

.ai-messages {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.ai-message {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 90%;
}

.ai-message.user {
    align-self: flex-end;
    align-items: flex-end;
}

.ai-message.bot {
    align-self: flex-start;
}

.ai-bubble {
    padding: 10px 14px;
    border-radius: 14px;
    font-size: var(--text-h8);
    line-height: var(--leading-snug);
    background-color: var(--background-color);
    color: var(--text-color);
    /* Программа тренировки приходит списком строк — переносы должны сохраниться */
    white-space: pre-line;
}

.ai-message.user .ai-bubble {
    background-color: var(--button-hover-color);
    color: var(--button-hover-color-white);
}

.ai-choices {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.ai-choice,
.ai-hint {
    padding: 8px 12px;
    font-size: var(--text-caption);
    border: 1px solid var(--button-border-color);
    border-radius: 999px;
    background: transparent;
    color: var(--text-color);
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
}

.ai-choice:hover,
.ai-hint:hover {
    background-color: var(--button-hover-color);
    color: var(--button-hover-color-white);
}

.ai-hints {
    padding: 0 20px 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.ai-hints-title {
    width: 100%;
    margin: 0;
    font-size: var(--text-caption);
    color: var(--text-color);
    opacity: 0.7;
}

.ai-input {
    display: flex;
    gap: 8px;
    padding: 14px 20px 20px;
    border-top: 1px solid var(--button-border-color);
}

.ai-input input {
    flex: 1 1 auto;
    min-width: 0;
    padding: 10px 14px;
    font-size: var(--text-h8);
    color: var(--text-color);
    background-color: var(--background-color);
    border: 1px solid var(--button-border-color);
    border-radius: 10px;
}

.ai-input button {
    padding: 10px 16px;
    border: none;
    border-radius: 10px;
    background-color: var(--button-hover-color);
    color: var(--button-hover-color-white);
    cursor: pointer;
}

.ai-input button:disabled {
    opacity: 0.5;
    cursor: default;
}

.ai-typing {
    display: flex;
    gap: 4px;
    align-items: center;
}

.ai-typing span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--text-color);
    opacity: 0.4;
    animation: ai-blink 1.2s infinite ease-in-out;
}

.ai-typing span:nth-child(2) {
    animation-delay: 0.2s;
}

.ai-typing span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes ai-blink {

    0%,
    80%,
    100% {
        opacity: 0.25;
    }

    40% {
        opacity: 1;
    }
}

@media (prefers-reduced-motion: reduce) {

    .ai-panel {
        transition: none;
    }

    .ai-typing span {
        animation: none;
    }
}
</style>
