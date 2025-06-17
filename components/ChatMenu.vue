<template>
  <div class="chat-wrapper">
    <h2 class="chat-title">Чат</h2>

    <!-- Выбор клиента (для тренера) -->
    <div v-if="isCoach && clients.length" class="client-select">
      <label for="client">Клиент:</label>
      <select v-model="selectedClientId">
        <option disabled value="">-- Выбрать клиента --</option>
        <option v-for="client in clients" :key="client.clientid" :value="client.clientid">
          {{ client.first_name }} {{ client.last_name }}
        </option>
      </select>
    </div>

    <!-- Сообщения -->
    <div class="chat-messages" ref="scrollBox">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message', { mine: msg.sender_id === userId }]"
      >
        <div class="bubble">{{ msg.text }}</div>
        <div class="time">{{ formatTimestamp(msg.timestamp) }}</div>
      </div>
    </div>

    <!-- Ввод -->
    <div class="chat-input">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        type="text"
        placeholder="Введите сообщение..."
      />
      <button @click="sendMessage">Отправить</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    user: Object
  },
  data() {
    return {
      messages: [],
      newMessage: '',
      selectedClientId: '',
      clients: [],
      coachId: null // 👈 сюда будет сохранён coach_id клиента
    };
  },
  computed: {
    isCoach() {
      return !!this.user?.coachid;
    },
    isClient() {
      return !!this.user?.clientid;
    },
    userId() {
      return this.user?.clientid || this.user?.coachid;
    },
    recipientId() {
      return this.isClient ? this.coachId : this.selectedClientId;
    }
  },
  methods: {
    formatTimestamp(ts) {
      return new Date(ts).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    async fetchCoachId() {
      try {
        const res = await fetch(`http://26.100.29.243:3000/api/clients/${this.user.clientid}/coach`);
        const coach = await res.json();
        this.coachId = coach.coachid;
        await this.fetchMessages(); // загружаем сообщения после получения coachid
      } catch (err) {
        console.error('Ошибка при получении тренера клиента:', err);
      }
    },
    async fetchMessages() {
      if (!this.recipientId || !this.userId) return;
      try {
        const res = await fetch(`http://26.100.29.243:3000/api/chat?senderId=${this.userId}&recipientId=${this.recipientId}`);
        this.messages = await res.json();
        this.scrollToBottom();
      } catch (err) {
        console.error('Ошибка загрузки сообщений:', err);
      }
    },
    async sendMessage() {
      if (!this.newMessage.trim() || !this.recipientId) return;

      const message = {
        sender_id: this.userId,
        recipient_id: this.recipientId,
        text: this.newMessage.trim(),
        timestamp: new Date().toISOString()
      };

      try {
        const res = await fetch('http://26.100.29.243:3000/api/chat/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        });

        if (res.ok) {
          this.newMessage = '';
          await this.fetchMessages(); // Обновим чат
        }
      } catch (err) {
        console.error('Ошибка отправки сообщения:', err);
      }
    },
    async fetchClients() {
      try {
        const res = await fetch(`http://26.100.29.243:3000/api/coaches/${this.user.coachid}/clients`);
        this.clients = await res.json();
      } catch {
        this.clients = [];
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const box = this.$refs.scrollBox;
        if (box) box.scrollTop = box.scrollHeight;
      });
    }
  },
  watch: {
    recipientId(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.fetchMessages();
      }
    }
  },
  mounted() {
    if (this.isCoach) {
      this.fetchClients();
    } else if (this.isClient) {
      this.fetchCoachId(); // 👈 загружаем coach_id через API
    }
  }
};
</script>

<style scoped>
.chat-wrapper {
  background: var(--background-color-white);
  border-radius: 12px;
  padding: 20px;
  max-width: 600px;
  margin: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: var(--text-color);
  transition: background-color 0.5s, color 0.5s;
}

.chat-title {
  font-size: 22px;
  margin-bottom: 16px;
  text-align: center;
  color: var(--text-color);
}

.client-select {
  margin-bottom: 12px;
  color: var(--text-color);
}

.client-select select {
  background: var(--background-color-white);
  border: 1px solid var(--button-border-color);
  color: var(--text-color);
  padding: 6px;
  border-radius: 6px;
  transition: background-color 0.3s, color 0.3s;
}

.chat-messages {
  height: 300px;
  overflow-y: auto;
  border: 1px solid var(--button-border-color);
  border-radius: 6px;
  padding: 10px;
  background: var(--background-color);
  margin-bottom: 12px;
}

.message {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.message.mine {
  align-items: flex-end;
}

.bubble {
  padding: 8px 12px;
  border-radius: 16px;
  max-width: 70%;
  border: 1px solid var(--button-border-color);
  color: var(--text-color);
}

.message.mine .bubble {
  background: var(--button-hover-color);
  color: #fff;
  border: 1px solid var(--button-hover-color);
}

.time {
  font-size: 12px;
  color: gray;
  margin-top: 4px;
}

.chat-input {
  display: flex;
  gap: 10px;
}

.chat-input input {
  flex-grow: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid var(--button-border-color);
  background: var(--background-color-white);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
}

.chat-input button {
  padding: 8px 14px;
  background: var(--button-hover-color);
  color: var(--button-hover-color-white);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}
</style>
