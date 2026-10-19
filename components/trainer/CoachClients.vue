<template>
    <div class="clients">
        <div class="toolbar">
            <label v-if="clients.length > 6" class="tt-search search">
                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                <input v-model.trim="query" type="search" placeholder="Найти клиента" aria-label="Поиск клиента" />
            </label>
            <span v-if="!loading" class="tt-chip tt-chip--muted">
                <i class="fa-solid fa-users"></i> {{ clients.length }} {{ clientsWord(clients.length) }}
            </span>
        </div>

        <div v-if="loading" class="grid">
            <span v-for="n in 3" :key="n" class="tt-skeleton card-skeleton"></span>
        </div>

        <div v-else-if="error" class="tt-note tt-note--error"><i class="fa-solid fa-circle-exclamation"></i> {{ error }}</div>

        <div v-else-if="!clients.length" class="tt-empty">
            <i class="fa-solid fa-user-plus"></i>
            У вас пока нет клиентов — они появятся, когда выберут вас тренером в своём профиле.
        </div>

        <div v-else class="grid">
            <article v-for="(client, index) in filteredClients" :key="client.clientid"
                :class="['tt-card', 'tt-card--lift', 'client', 'tt-stagger', { open: openId === client.clientid }]"
                :style="{ '--i': index }">
                <header class="client-head">
                    <span class="tt-avatar tt-avatar--blue client-avatar">{{ initialsOf(client.first_name, client.last_name) }}</span>
                    <div class="client-who">
                        <b>{{ client.first_name }} {{ client.last_name }}</b>
                        <span class="client-meta">{{ metaLine(client) }}</span>
                    </div>
                </header>

                <div class="tt-tile client-lines">
                    <a v-if="client.email" :href="`mailto:${client.email}`" class="line">
                        <i class="fa-solid fa-envelope"></i> <span>{{ client.email }}</span>
                    </a>
                    <a v-if="client.phone_number" :href="`tel:${client.phone_number}`" class="line">
                        <i class="fa-solid fa-phone"></i> <span>{{ client.phone_number }}</span>
                    </a>
                    <span v-if="client.birth_date" class="line">
                        <i class="fa-solid fa-cake-candles"></i> <span>{{ formatDate(client.birth_date) }}</span>
                    </span>
                </div>

                <div class="client-actions">
                    <button type="button" class="tt-btn tt-btn--ghost tt-btn--sm"
                        :aria-expanded="openId === client.clientid ? 'true' : 'false'"
                        @click="toggleProgress(client.clientid)">
                        <i class="fa-solid fa-chart-line"></i>
                        {{ openId === client.clientid ? 'Скрыть' : 'Прогресс' }}
                    </button>
                    <button type="button" class="tt-btn tt-btn--primary tt-btn--sm"
                        @click="$emit('navigate', 'chat', { client: client.clientid })">
                        <i class="fa-solid fa-comments"></i> Написать
                    </button>
                </div>

                <div v-if="openId === client.clientid" class="client-progress">
                    <div v-if="progressState(client.clientid) === 'loading'" class="progress-loading">
                        <span class="tt-dots" aria-label="Загрузка"><span></span><span></span><span></span></span>
                    </div>
                    <p v-else-if="progressState(client.clientid) === 'empty'" class="progress-empty">
                        Замеров пока нет — прогресс появится после первых записей клиента.
                    </p>
                    <template v-else>
                        <span class="progress-title">С первого замера</span>
                        <ProgressBars :summary="clientProgress[client.clientid]" :groups="progressGroups" compact />
                    </template>
                </div>
            </article>
            <p v-if="!filteredClients.length" class="nothing">Никого не нашли</p>
        </div>
    </div>
</template>

<script>
import ProgressBars from '@/components/profile/ProgressBars.vue';
import { readUser } from '@/components/utils/cabinet.js';
import { plural, joinName, initialsOf } from '@/components/utils/format.js';

const GENDERS = { male: 'Мужчина', female: 'Женщина' };

export default {
    name: 'CoachClients',
    components: { ProgressBars },
    data() {
        return {
            clients: [],
            loading: true,
            error: null,
            query: '',
            openId: null,
            // clientId → ответ /progress-summary, 'loading' или null (замеров нет)
            clientProgress: {},
            progressGroups: [
                {
                    title: '',
                    keys: ['Вес', 'Жировая масса', 'Мышечная масса', 'Процент жира', 'Метаболизм', 'Обхват талии']
                }
            ]
        };
    },
    computed: {
        filteredClients() {
            const query = this.query.toLowerCase();
            if (!query) return this.clients;
            return this.clients.filter(client =>
                joinName(client.first_name, client.last_name).toLowerCase().includes(query));
        }
    },
    mounted() {
        const user = readUser();
        if (!user || !user.coachid) {
            this.loading = false;
            return;
        }
        this.fetchClients(user.coachid);
    },
    methods: {
        initialsOf,
        clientsWord(n) {
            return plural(n, ['клиент', 'клиента', 'клиентов']);
        },
        formatDate(dateStr) {
            const date = new Date(dateStr);
            return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('ru-RU');
        },
        // «Женщина · 29 лет»
        metaLine(client) {
            const parts = [];
            const gender = GENDERS[(client.gender || '').toLowerCase()];
            if (gender) parts.push(gender);
            if (client.birth_date) {
                const birth = new Date(client.birth_date);
                if (!Number.isNaN(birth.getTime())) {
                    const now = new Date();
                    let age = now.getFullYear() - birth.getFullYear();
                    const beforeBirthday = now.getMonth() < birth.getMonth()
                        || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
                    if (beforeBirthday) age -= 1;
                    if (age > 0 && age < 120) parts.push(`${age} ${plural(age, ['год', 'года', 'лет'])}`);
                }
            }
            return parts.join(' · ') || 'Клиент';
        },
        progressState(clientId) {
            const value = this.clientProgress[clientId];
            if (value === 'loading' || value === undefined) return 'loading';
            return value ? 'ready' : 'empty';
        },
        async fetchClients(coachId) {
            try {
                const response = await fetch(`/api/coaches/${coachId}/clients`);
                if (!response.ok) throw new Error('Не удалось загрузить клиентов.');
                const data = await response.json();
                this.clients = Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('Ошибка при загрузке клиентов:', error);
                this.error = error.message === 'Failed to fetch'
                    ? 'Нет связи с сервером. Проверьте соединение.'
                    : error.message;
            } finally {
                this.loading = false;
            }
        },
        toggleProgress(clientId) {
            this.openId = this.openId === clientId ? null : clientId;
            if (this.openId && this.clientProgress[clientId] === undefined) this.fetchProgress(clientId);
        },
        async fetchProgress(clientId) {
            this.$set(this.clientProgress, clientId, 'loading');
            try {
                const response = await fetch(`/api/clients/${clientId}/progress-summary`);
                // 404 — у клиента ещё нет замеров
                this.$set(this.clientProgress, clientId, response.ok ? await response.json() : null);
            } catch (error) {
                console.error(`Ошибка при загрузке прогресса клиента ${clientId}:`, error);
                this.$delete(this.clientProgress, clientId);
            }
        }
    }
};
</script>

<style scoped>
.clients {
    display: grid;
    gap: 18px;
}

.toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}

.search {
    flex: 1 1 260px;
    max-width: 420px;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    align-items: start;
    gap: 16px;
}

.card-skeleton {
    height: 220px;
}

/* Рамка, фон, тень и подъём при наведении — от .tt-card */
.client {
    display: grid;
    gap: 16px;
    padding: 20px;
}

.client.open {
    border-color: var(--tt-brand);
}

.client-head {
    display: flex;
    align-items: center;
    gap: 14px;
}

.client-avatar {
    width: 52px;
    height: 52px;
    font-size: 18px;
}

.client.open .client-avatar {
    background: var(--tt-gradient-brand);
}

.client-who {
    display: grid;
    gap: 2px;
    min-width: 0;
}

.client-who b {
    overflow: hidden;
    color: var(--tt-ink);
    font-size: 17px;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.client-meta {
    color: var(--tt-muted);
    font-size: 13px;
}

.client-lines {
    display: grid;
    gap: 8px;
    padding: 14px;
}

.line {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    color: var(--tt-soft);
    font-size: 14px;
    text-decoration: none;
}

.line span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.line i {
    flex: none;
    width: 16px;
    color: var(--tt-brand);
    font-size: 13px;
    text-align: center;
}

a.line:hover {
    color: var(--tt-brand-deep);
}

.client-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.client-actions .tt-btn {
    padding: 0 12px;
}

.client-progress {
    display: grid;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid var(--tt-line);
    animation: progress-in 0.4s var(--tt-ease) both;
}

@keyframes progress-in {
    from {
        opacity: 0;
        transform: translateY(-6px);
    }
}

.progress-title {
    color: var(--tt-muted);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.progress-empty {
    margin: 0;
    color: var(--tt-muted);
    font-size: 14px;
    line-height: 1.5;
}

.progress-loading {
    display: flex;
    justify-content: center;
    padding: 10px 0;
}

.nothing {
    margin: 0;
    color: var(--tt-muted);
    font-size: 14px;
}

@media (prefers-reduced-motion: reduce) {
    .client-progress {
        animation: none;
    }
}
</style>
