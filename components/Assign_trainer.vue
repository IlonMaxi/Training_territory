<template>
  <div class="assign-form">
    <h2>НАЗНАЧИТЬ ТРЕНИРОВКУ</h2>
    <form @submit.prevent="assignTraining">
      <div class="form-group">
        <label for="client">Выберите клиента:</label>
        <select v-model="newTraining.client_id" id="client" required>
          <option disabled value="">-- Выберите клиента --</option>
          <option v-for="client in clients" :key="client.clientid" :value="client.clientid">
            {{ client.first_name }} {{ client.last_name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="workout">Выберите тренировку:</label>
        <select v-model="newTraining.workout_id" id="workout" required>
          <option disabled value="">-- Выберите тренировку --</option>
          <option v-for="workout in workouts" :key="workout.workoutid" :value="workout.workoutid">
            {{ workout.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="date">Дата:</label>
        <input type="date" v-model="newTraining.date" id="date" required />
      </div>
      <div class="form-group">
        <label for="start_time">Время начала:</label>
        <input type="time" v-model="newTraining.start_time" id="start_time" required />
      </div>
      <div class="form-group">
        <label for="end_time">Время окончания:</label>
        <input type="time" v-model="newTraining.end_time" id="end_time" required />
      </div>
      <div class="form-group">
        <label for="location">Место:</label>
        <input type="text" v-model="newTraining.location" id="location" required />
      </div>
      <button type="submit">Назначить тренировку</button>
      <div v-if="error" class="error-message">{{ error }}</div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      clients: [], // Список клиентов
      workouts: [], // Список тренировок
      newTraining: {
        client_id: '',
        workout_id: '',
        date: '',
        start_time: '',
        end_time: '',
        location: ''
      },
      error: null // Сообщение об ошибке
    };
  },
  computed: {
    coachId() {
      return this.$root.user?.coachid; // Используйте правильное написание
    }
  },
  methods: {
    // Метод для загрузки списка клиентов
    async fetchClients() {
      if (!this.coachId) {
        console.error('Coach ID не определен');
        this.error = 'Ошибка: тренер не определен';
        return;
      }
      try {
        const response = await fetch(`http://26.100.29.243:3000/api/coaches/${this.coachId}/clients`);
        if (!response.ok) {
          throw new Error('Не удалось получить список клиентов');
        }
        const data = await response.json();
        console.log('Полученные клиенты:', data);
        this.clients = data;
      } catch (error) {
        console.error(error);
        this.error = 'Ошибка при загрузке клиентов.';
      }
    },
    // Метод для загрузки списка тренировок
    async fetchWorkouts() {
      if (!this.coachId) {
        console.error('Coach ID не определен');
        this.error = 'Ошибка: тренер не определен';
        return;
      }
      try {
        const response = await fetch(`http://26.100.29.243:3000/api/coaches/${this.coachId}/workouts`);
        if (!response.ok) {
          throw new Error('Не удалось получить список тренировок');
        }
        const data = await response.json();
        console.log('Полученные тренировки:', data);
        this.workouts = data;
      } catch (error) {
        console.error(error);
        this.error = 'Ошибка при загрузке тренировок.';
      }
    },
    // Метод для назначения тренировки
    async assignTraining() {
      if (!this.coachId) {
        this.error = 'Ошибка: тренер не определен';
        return;
      }
      try {
        console.log('Назначение тренировки:', this.newTraining); // Логирование данных перед отправкой
        const response = await fetch(`http://26.100.29.243:3000/api/coaches/${this.coachId}/assign-training`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.newTraining)
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Не удалось назначить тренировку');
        }
        const result = await response.json();
        this.$emit('training-assigned'); // Сообщаем родителю об успешном добавлении
        alert('Тренировка успешно назначена');
        this.resetForm();
      } catch (error) {
        console.error(error);
        this.error = `Ошибка при назначении тренировки: ${error.message}`;
        alert(`Ошибка при назначении тренировки: ${error.message}`);
      }
    },
    // Метод для сброса формы
    resetForm() {
      this.newTraining = {
        client_id: '',
        workout_id: '',
        date: '',
        start_time: '',
        end_time: '',
        location: ''
      };
      this.error = null;
    }
  },
  watch: {
    // Watcher для отслеживания изменений в $root.user
    '$root.user'(newUser) {
      if (newUser && newUser.coachid) {
        this.fetchClients();
        this.fetchWorkouts();
      }
    }
  },
  async created() {
    console.log('Assign Component user:', this.$root.user); // Логирование объекта пользователя
    console.log('Extracted coachId:', this.coachId); // Логирование coachId
    if (this.coachId) {
      await Promise.all([this.fetchClients(), this.fetchWorkouts()]);
    }
  },
  async mounted() {
    // Дополнительная проверка в mounted
    if (!this.coachId && this.$root.user?.coachid) {
      this.fetchClients();
      this.fetchWorkouts();
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  margin-top: 20px;
  font-weight: bold;
  font-size: x-large;
  color: var(--text-color);
  transition: color 0.5s ease;
}

.modal {
  background: var(--background-color-white);
  color: var(--text-color);
  padding: 40px;
  border-radius: 10px;
  width: 70vw;
  position: relative;
  transition: background-color 0.5s ease, color 0.5s ease;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: var(--text-color);
  font-size: 20px;
  cursor: pointer;
  transition: color 0.5s ease;
}

.assign-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  padding: 20px 0;
}

.form-group {
  width: 100%;
  margin-bottom: 20px;
}

.form-group label {
  color: var(--text-color);
  font-weight: bold;
  margin-bottom: 5px;
  transition: color 0.5s ease;
}

.form-group select,
.form-group input {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid var(--button-border-color);
  background-color: var(--background-color);
  color: var(--text-color);
  transition: background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease;
}

button {
  padding: 10px 20px;
  background-color: var(--button-hover-color);
  border: none;
  color: var(--button-hover-color-white);
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 20px;
  width: 100%;
  transition: background-color 0.3s ease, color 0.3s ease;
}

button:hover {
  background-color: #e04a2a;
}

.error-message {
  color: red;
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
}

@media (max-width: 768px) {
  .modal {
    width: 90vw;
  }

  .form-group {
    width: 100%;
  }

  button {
    width: 100%;
  }
}
</style>