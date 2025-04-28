import { reactive } from 'vue';

export const theme = reactive({
  current: process.client ? (localStorage.getItem('theme') || 'light') : 'light',
  toggle() {
    this.current = this.current === 'light' ? 'dark' : 'light';
    if (process.client) {
      document.body.classList.remove('light-theme', 'dark-theme');
      document.body.classList.add(this.current + '-theme');
      localStorage.setItem('theme', this.current);
    }
  }
});
