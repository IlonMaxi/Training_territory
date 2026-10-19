<template>
  <div :class="['tt-board', 'tt-board--flush', 'chat', { 'chat--coach': isCoach }]">
    <!-- Тренер: список клиентов -->
    <aside v-if="isCoach" class="contacts" aria-label="Клиенты">
      <label v-if="clients.length > 6" class="tt-search contacts-search">
        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        <input v-model.trim="query" type="search" placeholder="Найти клиента" aria-label="Поиск клиента" />
      </label>
      <div v-if="loadingClients" class="contacts-list">
        <span v-for="n in 4" :key="n" class="tt-skeleton contact-skeleton"></span>
      </div>
      <p v-else-if="!clients.length" class="contacts-empty">Клиентов пока нет — они появятся, когда выберут вас тренером.</p>
      <div v-else class="contacts-list">
        <button v-for="client in filteredClients" :key="client.clientid" type="button"
          :class="['tt-nav-item', 'contact', { 'is-active': selectedClientId === client.clientid }]"
          :aria-pressed="selectedClientId === client.clientid ? 'true' : 'false'"
          @click="selectedClientId = client.clientid">
          <span class="tt-avatar tt-avatar--blue">{{ initialsOf(client.first_name, client.last_name) }}</span>
          <span class="contact-name">{{ fullName(client) }}</span>
          <i class="fa-solid fa-chevron-right contact-arrow" aria-hidden="true"></i>
        </button>
        <p v-if="!filteredClients.length" class="contacts-empty">Никого не нашли</p>
      </div>
    </aside>

    <!-- Переписка -->
    <section class="dialog" aria-label="Переписка">
      <header class="dialog-head">
        <span :class="['tt-avatar', { 'tt-avatar--blue': isCoach }]">{{ partner ? initialsOf(partner.first_name, partner.last_name) : '?' }}</span>
        <div class="dialog-who">
          <b>{{ partner ? fullName(partner) : (isCoach ? 'Клиент не выбран' : 'Тренер не выбран') }}</b>
          <small>{{ isCoach ? 'Клиент' : 'Ваш тренер' }}</small>
        </div>
        <button v-if="recipientId" type="button" class="tt-icon-btn refresh" title="Обновить" aria-label="Обновить"
          :disabled="loadingMessages" @click="fetchMessages()">
          <i :class="['fa-solid', 'fa-rotate', { 'fa-spin': loadingMessages }]"></i>
        </button>
      </header>

      <div ref="scrollBox" class="messages" aria-live="polite">
        <div v-if="!recipientId" class="placeholder">
          <span class="tt-icon-tile tt-icon-tile--lg placeholder-icon"><i class="fa-solid fa-comments"></i></span>
          <template v-if="isCoach">
            <b>Выберите клиента</b>
            <p>Переписка с ним откроется здесь.</p>
          </template>
          <template v-else-if="!loadingCoach">
            <b>Сначала выберите тренера</b>
            <p>Чат появится, когда у вас будет тренер.</p>
            <button type="button" class="tt-btn tt-btn--primary tt-btn--sm" @click="$emit('navigate', 'trainer')">
              <i class="fa-solid fa-user-tie"></i> Выбрать тренера
            </button>
          </template>
        </div>

        <template v-else>
          <div v-if="loadingMessages && !messages.length" class="placeholder">
            <span class="tt-dots" aria-label="Загрузка"><span></span><span></span><span></span></span>
          </div>
          <div v-else-if="!messages.length" class="placeholder">
            <span class="tt-icon-tile tt-icon-tile--lg placeholder-icon"><i class="fa-regular fa-paper-plane"></i></span>
            <b>Сообщений пока нет</b>
            <p>Напишите первым — {{ isCoach ? 'клиент' : 'тренер' }} увидит сообщение в чате.</p>
          </div>
          <template v-else>
            <div v-for="group in groups" :key="group.key" class="day">
              <div class="day-sep"><span>{{ group.label }}</span></div>
              <div v-for="(msg, index) in group.items" :key="`${group.key}-${index}`"
                :class="['msg', { mine: msg.sender_id === userId }]">
                <div :class="['tt-bubble', 'bubble', { 'tt-bubble--mine': msg.sender_id === userId }]">{{ msg.text }}<span class="time">{{ formatTimestamp(msg.timestamp) }}</span></div>
              </div>
            </div>
          </template>
        </template>
      </div>

      <form class="composer" @submit.prevent="sendMessage">
        <div class="tt-composer">
          <input v-model="newMessage" type="text" :disabled="!recipientId || sending" aria-label="Сообщение"
            :placeholder="recipientId ? 'Напишите сообщение…' : 'Выберите собеседника'" />
          <button type="submit" class="tt-send" :disabled="!recipientId || sending || !newMessage.trim()"
            aria-label="Отправить">
            <i :class="sending ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-paper-plane'"></i>
          </button>
        </div>
        <p v-if="error" class="tt-note tt-note--error"><i class="fa-solid fa-circle-exclamation"></i> {{ error }}</p>
      </form>
    </section>
  </div>
</template>

<script>
import { capitalize, joinName, initialsOf } from '@/components/utils/format.js';

const POLL_INTERVAL = 15000;

export default {
  name: 'ChatMenu',
  props: {
    user: { type: Object, default: null }
  },
  data() {
    return {
      messages: [],
      newMessage: '',
      selectedClientId: '',
      clients: [],
      query: '',
      coach: null,
      coachId: null,
      loadingClients: false,
      loadingCoach: false,
      loadingMessages: false,
      sending: false,
      error: null
    };
  },
  computed: {
    isCoach() {
      return Boolean(this.user && this.user.coachid);
    },
    isClient() {
      return Boolean(this.user && this.user.clientid);
    },
    userId() {
      return this.user && (this.user.clientid || this.user.coachid);
    },
    recipientId() {
      return this.isClient ? this.coachId : this.selectedClientId;
    },
    filteredClients() {
      const query = this.query.toLowerCase();
      if (!query) return this.clients;
      return this.clients.filter(client => this.fullName(client).toLowerCase().includes(query));
    },
    partner() {
      if (this.isCoach) return this.clients.find(client => client.clientid === this.selectedClientId) || null;
      return this.coach;
    },
    // Сообщения по дням: «Сегодня», «Вчера», «12 октября»
    groups() {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const groups = [];
      this.messages.forEach((msg) => {
        const date = new Date(msg.timestamp);
        const key = date.toDateString();
        let group = groups[groups.length - 1];
        if (!group || group.key !== key) {
          let label = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
          if (key === today.toDateString()) label = 'Сегодня';
          else if (key === yesterday.toDateString()) label = 'Вчера';
          group = { key, label: capitalize(label), items: [] };
          groups.push(group);
        }
        group.items.push(msg);
      });
      return groups;
    }
  },
  watch: {
    recipientId(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.messages = [];
        this.error = null;
        this.fetchMessages();
      }
    }
  },
  mounted() {
    if (this.isCoach) {
      this.fetchClients();
    } else if (this.isClient) {
      this.fetchCoach();
    }
    // Новые сообщения подтягиваем сами — пока вкладка открыта
    this.pollTimer = setInterval(() => {
      if (this.recipientId && document.visibilityState === 'visible') this.fetchMessages(true);
    }, POLL_INTERVAL);
  },
  beforeDestroy() {
    clearInterval(this.pollTimer);
  },
  methods: {
    initialsOf,
    fullName(person) {
      return joinName(person.first_name, person.last_name);
    },
    formatTimestamp(ts) {
      return new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    },
    async fetchCoach() {
      this.loadingCoach = true;
      try {
        const response = await fetch(`/api/clients/${this.user.clientid}/coach`);
        const coach = await response.json();
        if (response.ok && coach && coach.coachid) {
          this.coach = coach;
          this.coachId = coach.coachid;
        }
      } catch (error) {
        console.error('Ошибка при получении тренера клиента:', error);
      } finally {
        this.loadingCoach = false;
      }
    },
    async fetchClients() {
      this.loadingClients = true;
      try {
        const response = await fetch(`/api/coaches/${this.user.coachid}/clients`);
        const data = await response.json();
        this.clients = Array.isArray(data) ? data : [];
        // Пришли из карточки клиента (?client=12) — сразу открываем его переписку
        const fromQuery = Number(this.$route.query.client);
        if (fromQuery && this.clients.some(client => client.clientid === fromQuery)) {
          this.selectedClientId = fromQuery;
        }
      } catch (error) {
        console.error('Ошибка при загрузке клиентов:', error);
        this.clients = [];
      } finally {
        this.loadingClients = false;
      }
    },
    // silent — фоновое обновление: без индикатора и без прокрутки, если ничего не пришло
    async fetchMessages(silent = false) {
      if (!this.recipientId || !this.userId) return;
      const recipient = this.recipientId;
      if (!silent) this.loadingMessages = true;
      try {
        const response = await fetch(`/api/chat?senderId=${this.userId}&recipientId=${recipient}`);
        const data = await response.json();
        // Пока ждали ответ, могли переключиться на другого собеседника
        if (recipient !== this.recipientId) return;
        const list = Array.isArray(data) ? data : [];
        const changed = list.length !== this.messages.length;
        this.messages = list;
        if (!silent || changed) this.scrollToBottom();
      } catch (error) {
        console.error('Ошибка загрузки сообщений:', error);
      } finally {
        if (!silent) this.loadingMessages = false;
      }
    },
    async sendMessage() {
      const text = this.newMessage.trim();
      if (!text || !this.recipientId || this.sending) return;
      this.sending = true;
      this.error = null;

      const message = {
        sender_id: this.userId,
        recipient_id: this.recipientId,
        text,
        timestamp: new Date().toISOString()
      };

      try {
        const response = await fetch('/api/chat/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        });
        if (!response.ok) throw new Error('Сообщение не отправилось. Попробуйте ещё раз.');
        this.newMessage = '';
        await this.fetchMessages();
      } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
        this.error = error.message === 'Failed to fetch' ? 'Нет связи с сервером.' : error.message;
      } finally {
        this.sending = false;
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const box = this.$refs.scrollBox;
        if (box) box.scrollTop = box.scrollHeight;
      });
    }
  }
};
</script>

<style scoped>
/* Окно — панель .tt-board без отступов: список и переписка сами прижаты к краям */
.chat {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  height: min(680px, calc(100vh - 220px));
  min-height: 460px;
}

.chat--coach {
  grid-template-columns: 280px minmax(0, 1fr);
}

/* ---------- список клиентов ---------- */

.contacts {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  padding: 16px;
  border-right: 1px solid var(--tt-line);
  background-color: var(--tt-bg-soft);
}

.contacts-search {
  flex: none;
}

.contacts-list {
  display: grid;
  align-content: start;
  gap: 4px;
  min-height: 0;
  overflow-y: auto;
}

.contact-skeleton {
  height: 54px;
  border-radius: var(--tt-radius-md);
}

.contacts-empty {
  margin: 8px 4px;
  color: var(--tt-muted);
  font-size: 14px;
  line-height: 1.5;
}

/* Пункт списка — .tt-nav-item; на мягком фоне колонки подсветка белая */
.contact:hover,
.contact.is-active {
  background-color: var(--tt-surface);
}

.contact-name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.contact-arrow {
  color: var(--tt-muted);
  font-size: 11px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.contact:hover .contact-arrow,
.contact.is-active .contact-arrow {
  opacity: 1;
}

/* ---------- переписка ---------- */

.dialog {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.dialog-head {
  display: flex;
  flex: none;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--tt-line);
}

.dialog-who {
  display: grid;
  flex: 1 1 auto;
  min-width: 0;
}

.dialog-who b {
  overflow: hidden;
  color: var(--tt-ink);
  font-size: 16px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.dialog-who small {
  color: var(--tt-muted);
  font-size: 13px;
}

.refresh:hover {
  transform: none;
}

.messages {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 6px;
  min-height: 0;
  padding: 18px 20px;
  overflow-y: auto;
  overscroll-behavior: contain;
  background:
    radial-gradient(circle at 100% 0%, rgba(248, 80, 10, 0.06), transparent 45%),
    var(--tt-surface);
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: auto;
  max-width: 300px;
  color: var(--tt-muted);
  font-size: 14px;
  text-align: center;
}

.placeholder b {
  color: var(--tt-ink);
  font-size: 17px;
}

.placeholder p {
  margin: 0 0 6px;
  line-height: 1.5;
}

.placeholder-icon {
  margin-bottom: 4px;
}

.day {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.day-sep {
  display: flex;
  justify-content: center;
  margin: 10px 0 6px;
}

.day-sep span {
  padding: 4px 12px;
  border-radius: var(--tt-radius-pill);
  background-color: var(--tt-bg-soft);
  color: var(--tt-muted);
  font-size: 12px;
  font-weight: 600;
}

.msg {
  display: flex;
  max-width: 78%;
  animation: msg-in 0.35s var(--tt-ease) both;
}

.msg.mine {
  align-self: flex-end;
}

@keyframes msg-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

/* Пузырь — .tt-bubble; снизу меньше отступ: там время */
.bubble {
  padding-bottom: 8px;
}

.time {
  float: right;
  margin: 6px 0 0 12px;
  color: var(--tt-muted);
  font-size: 11px;
  line-height: 1;
}

.mine .time {
  color: rgba(255, 255, 255, 0.75);
}

.composer {
  flex: none;
  padding: 12px 16px 16px;
  border-top: 1px solid var(--tt-line);
}

.composer .tt-note {
  margin: 10px 0 0;
}

/* На узком экране список клиентов — лентой над перепиской */
@media (max-width: 760px) {
  .chat--coach {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    height: calc(100vh - 140px);
  }

  .contacts {
    padding: 12px;
    border-right: 0;
    border-bottom: 1px solid var(--tt-line);
  }

  .contacts-list {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
  }

  .contacts-list::-webkit-scrollbar {
    display: none;
  }

  .contact {
    flex: none;
    width: auto;
    padding: 6px 14px 6px 6px;
    border-color: var(--tt-line);
    border-radius: var(--tt-radius-pill);
    background-color: var(--tt-surface);
  }

  .contact .tt-avatar {
    width: 30px;
    height: 30px;
    font-size: 11px;
  }

  .contact-arrow {
    display: none;
  }

  .msg {
    max-width: 88%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .msg {
    animation: none;
  }
}
</style>
