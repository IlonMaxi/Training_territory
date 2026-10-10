import { reactive } from 'vue';

// Общее состояние панели-ассистента. Vuex в проекте не подключён,
// поэтому используем тот же приём, что и в ThemeManager: один реактивный
// объект, который импортируют и шапка, и layout, и сама панель.
const aiChat = reactive({
  isOpen: false,
  messages: [],

  open() {
    this.isOpen = true;
  },

  close() {
    this.isOpen = false;
  },

  toggle() {
    this.isOpen = !this.isOpen;
  },

  addMessage(author, text, options = {}) {
    this.messages.push({
      id: `${Date.now()}-${this.messages.length}`,
      author, // 'user' | 'bot'
      text,
      choices: options.choices || null
    });
  },

  reset() {
    this.messages = [];
  }
});

export default aiChat;
export { aiChat };
