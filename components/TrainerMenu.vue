<template>
  <div class="trainer-container">
    <div v-if="coach" class="trainer-current">
      <div class="trainer-photo">
        <img :src="photoUrl" alt="Фото тренера" @error="onImageError($event)" />
        <div class="border-accent"></div>
      </div>
      <div class="trainer-info">
        <p>
          Привет! Меня зовут <strong>{{ coach.first_name }} {{ coach.last_name }}</strong>, я ваш персональный тренер на платформе Trening Territory.
          <br />
          Специализируюсь на <strong>{{ coach.specialization || 'общих тренировках' }}</strong>.
          <br />
          Опыт работы — <strong>{{ coach.experience || 'не указан' }}</strong>.
        </p>
        <div class="contact-block">
          <p><strong>Связь:</strong> {{ coach.email }} / {{ coach.phone_number }}</p>
        </div>
        <button class="remove-button" @click="removeCoach">Убрать тренера</button>
      </div>
    </div>

    <div v-else class="no-coach-message">
      <p>У вас пока нет назначенного тренера. Выберите одного из списка ниже:</p>
    </div>

    <div v-if="coach" class="change-coach-message">
      <p>Что-то не так? Всегда можно выбрать нового тренера из списка:</p>
    </div>

    <div class="all-coaches">
      <h3>Доступные тренеры</h3>
      <div class="coach-cards">
        <div v-for="c in allCoaches" :key="c.coachid" class="coach-card">
          <img :src="getCoachPhoto(c.image)" :alt="c.first_name" @error="onImageError($event)" />
          <div class="coach-info">
            <strong>{{ c.first_name }} {{ c.last_name }}</strong>
            <p>Специализация: {{ c.specialization || 'не указана' }}</p>
            <p>Опыт: {{ c.experience || 'не указан' }}</p>
            <button @click="assignCoach(c.coachid)">Выбрать тренера</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TrainerMenu",
  data() {
    return {
      coach: null,
      allCoaches: []
    };
  },
  computed: {
    photoUrl() {
      return this.getCoachPhoto(this.coach?.image);
    }
  },
  methods: {
    getCoachPhoto(image) {
      const basePath = 'http://26.100.29.243:3000/api/uploads/';
      return image && image !== 'default.jpg' ? `${basePath}${image}` : `${basePath}default.jpg`;
    },
    onImageError(event) {
      event.target.src = 'http://26.100.29.243:3000/api/uploads/default.jpg';
    },
    fetchUserCoach(userId) {
      fetch(`http://26.100.29.243:3000/api/clients/${userId}/coach`)
        .then(res => res.json())
        .then(data => {
          this.coach = data.error ? null : data;
        });
    },
    fetchAllCoaches() {
      fetch(`http://26.100.29.243:3000/api/coaches`)
        .then(res => res.json())
        .then(data => this.allCoaches = data);
    },
    assignCoach(coachId) {
      const user = this.getUser();
      fetch(`http://26.100.29.243:3000/api/clients/${user.clientid}/coach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachId })
      })
        .then(() => this.fetchUserCoach(user.clientid));
    },
    removeCoach() {
      const user = this.getUser();
      fetch(`http://26.100.29.243:3000/api/clients/${user.clientid}/coach`, {
        method: 'DELETE'
      })
        .then(() => this.coach = null);
    },
    getUser() {
      const cookies = document.cookie.split('; ').reduce((acc, c) => {
        const [key, val] = c.split('=');
        acc[key] = decodeURIComponent(val);
        return acc;
      }, {});
      return JSON.parse(cookies.user || '{}');
    }
  },
  mounted() {
    const user = this.getUser();
    if (user.clientid) {
      this.fetchUserCoach(user.clientid);
      this.fetchAllCoaches();
    }
  }
};
</script>

<style scoped>
.trainer-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 20px;
  color: var(--text-color);
  background-color: var(--background-color);
  border-radius: 10px;
  margin: auto;
}

.trainer-current {
  display: flex;
  gap: 40px;
}

.trainer-photo img {
  width: 300px;
  border-radius: 20px;
  object-fit: cover;
}

.border-accent {
  position: absolute;
  bottom: -10px;
  right: -10px;
  width: 90%;
  height: 90%;
  border: 10px solid var(--button-hover-color);
  border-radius: 20px;
  z-index: -1;
}

.trainer-info {
  flex: 1;
  font-size: 16px;
  line-height: 1.6;
}

.contact-block {
  background-color: var(--background-color-white);
  padding: 20px;
  border-radius: 15px;
  margin-top: 20px;
}

.change-coach-text {
  margin-top: 16px;
  font-style: italic;
}

.remove-button {
  background-color: #f15a29;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
}

.all-coaches {
  margin-top: 20px;
}

.coach-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.coach-card {
  background-color: var(--background-color-white);
  padding: 16px;
  border-radius: 12px;
  width: 250px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.coach-card img {
  width: 100%;
  border-radius: 10px;
  object-fit: cover;
}

.coach-info {
  margin-top: 10px;
  font-size: 14px;
}

.coach-info button {
  background-color: var(--button-hover-color);
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  margin-top: 10px;
  cursor: pointer;
}

.no-coach-message {
  font-style: italic;
}
</style>
