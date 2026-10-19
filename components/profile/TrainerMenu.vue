<template>
  <div class="trainer">
    <!-- Текущий тренер -->
    <div v-if="loading" class="tt-skeleton current-skeleton"></div>

    <article v-else-if="coach" class="tt-board current">
      <div class="current-photo">
        <img v-if="hasPhoto(coach)" :src="photoOf(coach)" :alt="`${coach.first_name} ${coach.last_name}`"
          @error="markPhotoFailed(coach)" />
        <!-- Фото нет или не загрузилось — фирменная заглушка с линейной гантелью -->
        <SportArt v-else name="dumbbell" class="photo-art" />
        <span class="current-badge"><i class="fa-solid fa-circle-check"></i> Ваш тренер</span>
      </div>

      <div class="current-info">
        <h2 class="current-name">{{ coach.first_name }} {{ coach.last_name }}</h2>
        <div class="current-tags">
          <span class="tt-chip"><i class="fa-solid fa-dumbbell"></i> {{ coach.specialization || 'Общие тренировки' }}</span>
          <span class="tt-chip tt-chip--blue"><i class="fa-solid fa-medal"></i> Опыт: {{ coach.experience || 'не указан' }}</span>
        </div>
        <p class="current-text">
          Составляет тренировки и следит за прогрессом. Вопросы о нагрузке, технике и питании — в чат.
        </p>

        <div class="contacts">
          <a v-if="coach.email" :href="`mailto:${coach.email}`" class="tt-tile contact">
            <span class="tt-icon-tile tt-icon-tile--sm"><i class="fa-solid fa-envelope"></i></span>
            <span class="contact-text"><small>Почта</small>{{ coach.email }}</span>
          </a>
          <a v-if="coach.phone_number" :href="`tel:${coach.phone_number}`" class="tt-tile contact">
            <span class="tt-icon-tile tt-icon-tile--sm"><i class="fa-solid fa-phone"></i></span>
            <span class="contact-text"><small>Телефон</small>{{ coach.phone_number }}</span>
          </a>
        </div>

        <div class="current-actions">
          <button type="button" class="tt-btn tt-btn--primary tt-btn--sm" @click="$emit('navigate', 'chat')">
            <i class="fa-solid fa-comments"></i> Написать в чат
          </button>
          <button type="button" class="tt-btn tt-btn--danger tt-btn--sm" @click="confirm = { type: 'remove' }">
            Отказаться от тренера
          </button>
        </div>
      </div>
    </article>

    <div v-else class="no-coach">
      <span class="tt-icon-tile tt-icon-tile--lg tt-icon-tile--solid"><i class="fa-solid fa-user-plus"></i></span>
      <div>
        <h2 class="no-coach-title">Тренер ещё не выбран</h2>
        <p>Выберите тренера из списка ниже — он начнёт назначать вам тренировки.</p>
      </div>
    </div>

    <!-- Все тренеры -->
    <section class="all" aria-labelledby="all-coaches">
      <div class="all-head">
        <h3 id="all-coaches" class="tt-col-title">
          <span class="tt-col-icon"><i class="fa-solid fa-users"></i></span>
          {{ coach ? 'Сменить тренера' : 'Доступные тренеры' }}
        </h3>
        <span v-if="!loadingAll" class="tt-chip tt-chip--muted">{{ allCoaches.length }}</span>
      </div>

      <div v-if="loadingAll" class="coach-grid">
        <span v-for="n in 3" :key="n" class="tt-skeleton card-skeleton"></span>
      </div>
      <div v-else-if="allCoaches.length" class="coach-grid">
        <article v-for="(item, index) in allCoaches" :key="item.coachid"
          :class="['tt-card', 'tt-card--lift', 'coach-card', 'tt-stagger', { 'is-current': coach && coach.coachid === item.coachid }]"
          :style="{ '--i': index }">
          <div class="card-photo">
            <img v-if="hasPhoto(item)" :src="photoOf(item)" :alt="item.first_name" loading="lazy"
              @error="markPhotoFailed(item)" />
            <SportArt v-else name="dumbbell" class="photo-art" />
          </div>
          <div class="card-body">
            <b class="card-name">{{ item.first_name }} {{ item.last_name }}</b>
            <span class="card-line"><i class="fa-solid fa-dumbbell"></i> {{ item.specialization || 'Общие тренировки' }}</span>
            <span class="card-line"><i class="fa-solid fa-medal"></i> Опыт: {{ item.experience || 'не указан' }}</span>
          </div>
          <span v-if="coach && coach.coachid === item.coachid" class="tt-chip card-current">
            <i class="fa-solid fa-circle-check"></i> Ваш тренер
          </span>
          <button v-else type="button" class="tt-btn tt-btn--ghost tt-btn--sm card-btn" :disabled="busy"
            @click="choose(item)">
            Выбрать <span class="tt-arrow" aria-hidden="true">→</span>
          </button>
        </article>
      </div>
      <div v-else class="tt-empty">
        <i class="fa-solid fa-user-slash"></i>
        Тренеров пока нет
      </div>

      <p v-if="error" class="tt-note tt-note--error"><i class="fa-solid fa-circle-exclamation"></i> {{ error }}</p>
    </section>

    <ConfirmDialog :open="Boolean(confirm)" :danger="confirm && confirm.type === 'remove'"
      :icon="confirm && confirm.type === 'remove' ? 'fa-solid fa-user-minus' : 'fa-solid fa-user-check'"
      :title="confirm && confirm.type === 'remove' ? 'Отказаться от тренера?' : 'Сменить тренера?'"
      :confirm-label="confirm && confirm.type === 'remove' ? 'Отказаться' : 'Сменить'" cancel-label="Оставить"
      :busy="busy" @confirm="applyConfirm" @cancel="confirm = null">
      <template v-if="confirm && confirm.type === 'remove'">
        Новые тренировки перестанут назначаться, пока вы не выберете тренера снова.
      </template>
      <template v-else-if="confirm">
        Вашим тренером станет <b>{{ confirm.coach.first_name }} {{ confirm.coach.last_name }}</b>.
        Уже назначенные тренировки останутся в расписании.
      </template>
    </ConfirmDialog>
  </div>
</template>

<script>
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import SportArt from '@/components/ui/SportArt.vue';
import { readUser } from '@/components/utils/cabinet.js';

export default {
  name: 'TrainerMenu',
  components: { ConfirmDialog, SportArt },
  data() {
    return {
      coach: null,
      // coachid тренеров, чьё фото не загрузилось
      failedPhotos: {},
      allCoaches: [],
      loading: true,
      loadingAll: true,
      busy: false,
      error: null,
      // { type: 'remove' } или { type: 'change', coach }
      confirm: null
    };
  },
  computed: {
    clientId() {
      const user = readUser();
      return user && user.clientid;
    }
  },
  mounted() {
    if (!this.clientId) {
      this.loading = false;
      this.loadingAll = false;
      return;
    }
    this.fetchUserCoach();
    this.fetchAllCoaches();
  },
  methods: {
    // default.jpg — общая картинка «без фото»: вместо неё рисуем свою заглушку
    hasPhoto(coach) {
      const image = coach && coach.image;
      return Boolean(image && image !== 'default.jpg' && !this.failedPhotos[coach.coachid]);
    },
    photoOf(coach) {
      return `/api/uploads/${coach.image}`;
    },
    markPhotoFailed(coach) {
      this.$set(this.failedPhotos, coach.coachid, true);
    },
    async fetchUserCoach() {
      try {
        const response = await fetch(`/api/clients/${this.clientId}/coach`);
        const data = await response.json();
        this.coach = response.ok && data && !data.error ? data : null;
      } catch (error) {
        console.error('Не удалось загрузить тренера:', error);
        this.coach = null;
      } finally {
        this.loading = false;
      }
    },
    async fetchAllCoaches() {
      try {
        const response = await fetch('/api/coaches');
        const data = await response.json();
        this.allCoaches = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Не удалось загрузить тренеров:', error);
        this.allCoaches = [];
      } finally {
        this.loadingAll = false;
      }
    },
    // Без тренера выбираем сразу, при смене — сначала спрашиваем
    choose(coach) {
      if (this.coach) {
        this.confirm = { type: 'change', coach };
        return;
      }
      this.assignCoach(coach.coachid);
    },
    applyConfirm() {
      if (!this.confirm) return;
      if (this.confirm.type === 'remove') this.removeCoach();
      else this.assignCoach(this.confirm.coach.coachid);
    },
    async assignCoach(coachId) {
      this.busy = true;
      this.error = null;
      try {
        const response = await fetch(`/api/clients/${this.clientId}/coach`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coachId })
        });
        if (!response.ok) throw new Error('Не удалось выбрать тренера. Попробуйте ещё раз.');
        await this.fetchUserCoach();
        this.confirm = null;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        this.error = error.message;
        this.confirm = null;
      } finally {
        this.busy = false;
      }
    },
    async removeCoach() {
      this.busy = true;
      this.error = null;
      try {
        const response = await fetch(`/api/clients/${this.clientId}/coach`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Не удалось убрать тренера. Попробуйте ещё раз.');
        this.coach = null;
        this.confirm = null;
      } catch (error) {
        this.error = error.message;
        this.confirm = null;
      } finally {
        this.busy = false;
      }
    }
  }
};
</script>

<style scoped>
.trainer {
  display: grid;
  gap: 32px;
}

.current-skeleton {
  height: 340px;
  border-radius: var(--tt-radius-xl);
}

/* ---------- текущий тренер ---------- */

/* Панель — .tt-board */
.current {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 32px;
}

.current-photo {
  position: relative;
  display: grid;
  place-items: center;
  align-self: start;
  aspect-ratio: 4 / 5;
  border-radius: var(--tt-radius-lg);
  background: var(--tt-gradient-photo);
}

/* Оранжевая рамка «за» фото — сдвинута, как акцент из прежнего дизайна */
.current-photo::before {
  content: "";
  position: absolute;
  inset: 14px -14px -14px 14px;
  z-index: 0;
  border: 3px solid var(--tt-brand);
  border-radius: var(--tt-radius-lg);
  opacity: 0.45;
}

.current-photo img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  border-radius: var(--tt-radius-lg);
  object-fit: cover;
}

.current-badge {
  position: absolute;
  bottom: 14px;
  left: 14px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--tt-radius-pill);
  background-color: rgba(15, 20, 39, 0.75);
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}

.current-badge i {
  color: #34d399;
}

.current-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
  padding: 6px 0;
}

.current-name {
  margin: 0;
  color: var(--tt-ink);
  font-size: 32px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.current-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.current-text {
  max-width: 520px;
  margin: 0;
  color: var(--tt-soft);
  font-size: 15px;
  line-height: 1.6;
}

.contacts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
  width: 100%;
}

/* Плитка — .tt-tile */
.contact {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 12px 14px;
  color: var(--tt-ink);
  text-decoration: none;
  transition: border-color 0.25s ease, transform 0.3s var(--tt-ease);
}

.contact:hover {
  border-color: var(--tt-line-brand);
  transform: translateY(-2px);
}

.contact-text {
  display: grid;
  min-width: 0;
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.contact-text small {
  color: var(--tt-muted);
  font-size: 12px;
  font-weight: 500;
}

.current-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: auto;
  padding-top: 6px;
}

/* ---------- нет тренера ---------- */

.no-coach {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px;
  border: 1.5px dashed var(--tt-line-brand);
  border-radius: var(--tt-radius-xl);
  background-color: var(--tt-brand-50);
}

.no-coach-title {
  margin: 0 0 4px;
  color: var(--tt-ink);
  font-size: 20px;
  font-weight: 700;
}

.no-coach p {
  margin: 0;
  color: var(--tt-soft);
  font-size: 15px;
  line-height: 1.55;
}

/* ---------- все тренеры ---------- */

.all {
  display: grid;
  gap: 16px;
}

.all-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.coach-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.card-skeleton {
  height: 330px;
}

/* Карточка — .tt-card. Фото внутри: радиус = радиус карточки минус отступ (12px),
   чтобы углы шли параллельно */
.coach-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 12px 16px;
}

.coach-card.is-current {
  border-color: var(--tt-brand);
}

.card-photo {
  display: grid;
  place-items: center;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: var(--tt-radius-sm);
  background: var(--tt-gradient-photo);
}

/* Заглушка без фото: белая линейная гантель на градиенте.
   Через родителя — чтобы перебить размеры из стилей самого SportArt */
.current-photo .photo-art,
.card-photo .photo-art {
  --art-line: #ffffff;
  --art-detail: rgba(255, 255, 255, 0.6);
  --art-accent: #16203a;
  position: relative;
  z-index: 1;
  width: 72%;
  height: 72%;
}

.card-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--tt-ease);
}

.coach-card:hover .card-photo img {
  transform: scale(1.05);
}

.card-body {
  display: grid;
  gap: 6px;
  padding: 0 4px;
}

.card-name {
  color: var(--tt-ink);
  font-size: 17px;
}

.card-line {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--tt-soft);
  font-size: 13px;
}

.card-line i {
  width: 14px;
  color: var(--tt-brand);
  font-size: 12px;
  text-align: center;
}

.card-btn,
.card-current {
  align-self: flex-start;
  margin: auto 4px 0;
}

.card-current {
  padding: 8px 12px;
}

@media (max-width: 760px) {
  .current {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
  }

  .current-photo {
    width: min(280px, 100% - 14px);
  }

  .current-name {
    font-size: 26px;
  }
}

@media (prefers-reduced-motion: reduce) {

  .card-photo img,
  .contact {
    transition: none;
  }

  .coach-card:hover .card-photo img,
  .contact:hover {
    transform: none;
  }
}
</style>
