<template>
  <section id="progress" class="tt-container" aria-labelledby="progress-title">
    <SectionHead eyebrow="Прогресс" icon="fa-solid fa-chart-line" title-id="progress-title"
      lead="Из замеров строятся графики и прогресс в процентах относительно первого измерения.">
      Внесите <span class="tt-accent">замеры</span>
    </SectionHead>

    <Reveal class="tt-board" :y="16" :amount="0.1">
      <form @submit.prevent="submitMeasurements">
        <div class="measure-top">
          <label class="tt-field date-field">
            <span class="tt-field-label">Дата замера</span>
            <input class="tt-input" type="date" v-model="form.date" required />
          </label>
          <nuxt-link :to="{ path: '/Profile', query: { menu: 'progress' } }" class="progress-link">
            <i class="fa-solid fa-chart-line"></i> Смотреть графики <span class="tt-arrow" aria-hidden="true">→</span>
          </nuxt-link>
        </div>

        <div class="tt-segment tabs" role="tablist" aria-label="Группы замеров">
          <button v-for="tab in tabs" :key="tab.key" type="button" role="tab"
            :aria-selected="activeTab === tab.key ? 'true' : 'false'" :class="{ 'is-active': activeTab === tab.key }"
            @click="activeTab = tab.key">
            <i :class="tab.icon"></i> {{ tab.label }}
            <span v-if="filledIn(tab.key)" class="filled-badge">{{ filledIn(tab.key) }}</span>
          </button>
        </div>

        <transition name="tt-swap" mode="out-in">
          <div :key="activeTab" class="fields">
            <label v-for="(value, key, index) in form[activeTab]" :key="key" class="tt-tile measure-field"
              :style="{ '--i': index }">
              <span class="measure-label">{{ formatLabel(key) }}</span>
              <span class="measure-input">
                <input class="tt-input" type="number" step="0.01" v-model="form[activeTab][key]" placeholder="—" />
                <span v-if="unitOf(activeTab, key)" class="unit">{{ unitOf(activeTab, key) }}</span>
              </span>
            </label>
          </div>
        </transition>

        <div class="measure-bottom">
          <span class="filled-total">Заполнено полей: <b>{{ filledTotal }}</b> из {{ totalFields }}</span>
          <button type="submit" class="tt-btn tt-btn--primary" :disabled="submitting">
            {{ submitting ? 'Сохраняю…' : 'Сохранить замеры' }}
            <span v-if="!submitting" class="tt-arrow" aria-hidden="true">→</span>
          </button>
        </div>

        <transition name="tt-swap">
          <p v-if="success" class="tt-note tt-note--ok" role="status">
            <i class="fa-solid fa-circle-check"></i> Замеры сохранены — прогресс обновится в профиле
          </p>
        </transition>
        <p v-if="error" class="tt-note tt-note--error" role="alert">
          <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
        </p>
      </form>
    </Reveal>
  </section>
</template>

<script>
import Reveal from '@/components/ui/Reveal.vue';
import SectionHead from '@/components/ui/SectionHead.vue';

const TAB_UNITS = { kg: 'кг', cm: 'см', percentage: '%', weight_machine: 'кг' };
const FIELD_UNITS = { metabolism: 'ккал', body_age: 'лет' };

const emptyForm = () => ({
  date: '',
  unit: { bmi: null, metabolism: null, body_age: null },
  kg: {
    weight: null, fat_mass: null, skeletal_mass: null, muscle_mass: null,
    water_content: null, bone_mass: null, lbm: null
  },
  cm: {
    chest_circumference: null, waist_circumference: null, hip_circumference: null,
    bicep_circumference: null, forearm_circumference: null, quadriceps_circumference: null,
    calf_circumference: null, thigh_circumference: null, neck_circumference: null,
    waist_inhale_circumference: null
  },
  percentage: {
    fat_percentage: null, skeletal_mass_percentage: null, muscle_dynamics: null,
    body_water: null, protein: null, fat_content: null
  },
  weight_machine: { machine_weight: null }
});

const isFilled = (value) => value !== null && value !== undefined && value !== '';

export default {
  name: 'AddMeasurements',
  components: { Reveal, SectionHead },
  props: {
    // Вошедший клиент (из cookie, его восстанавливает ClientPage)
    client: { type: Object, default: null }
  },
  data() {
    return {
      activeTab: 'unit',
      submitting: false,
      success: false,
      error: null,
      form: emptyForm(),
      tabs: [
        { key: 'unit', label: 'Единицы', icon: 'fa-solid fa-gauge' },
        { key: 'kg', label: 'Килограммы', icon: 'fa-solid fa-weight-scale' },
        { key: 'cm', label: 'Сантиметры', icon: 'fa-solid fa-ruler' },
        { key: 'percentage', label: 'Проценты', icon: 'fa-solid fa-percent' },
        { key: 'weight_machine', label: 'Тренажёр', icon: 'fa-solid fa-dumbbell' }
      ]
    }
  },
  computed: {
    clientId() {
      return this.client && this.client.clientid;
    },
    totalFields() {
      return this.tabs.reduce((sum, tab) => sum + Object.keys(this.form[tab.key]).length, 0);
    },
    filledTotal() {
      return this.tabs.reduce((sum, tab) => sum + this.filledIn(tab.key), 0);
    }
  },
  methods: {
    filledIn(tab) {
      return Object.values(this.form[tab]).filter(isFilled).length;
    },
    unitOf(tab, key) {
      return FIELD_UNITS[key] || TAB_UNITS[tab] || '';
    },
    async submitMeasurements() {
      this.error = null;
      this.success = false;

      if (!this.clientId) {
        this.error = 'Не удалось определить клиента — войдите заново.';
        return;
      }

      this.submitting = true;
      try {
        const response = await fetch(`/api/clients/${this.clientId}/add-full-measurement`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        });
        if (!response.ok) throw new Error((await response.json()).error || 'Ошибка при отправке замеров');
        this.resetForm();
        this.success = true;
        setTimeout(() => { this.success = false; }, 5000);
      } catch (error) {
        this.error = error.message;
      } finally {
        this.submitting = false;
      }
    },
    resetForm() {
      this.form = emptyForm();
    },
    formatLabel(key) {
      const map = {
        bmi: 'ИМТ', body_age: 'Возраст тела', metabolism: 'Метаболизм',
        weight: 'Вес', fat_mass: 'Жировая масса', skeletal_mass: 'Скелетная масса', muscle_mass: 'Мышцы',
        water_content: 'Содержание воды', bone_mass: 'Костная масса', lbm: 'LBM (масса без жира)',
        chest_circumference: 'Грудь', waist_circumference: 'Талия', hip_circumference: 'Бёдра',
        bicep_circumference: 'Бицепс', forearm_circumference: 'Предплечье', quadriceps_circumference: 'Квадрицепс',
        calf_circumference: 'Икра', thigh_circumference: 'Бедро', neck_circumference: 'Шея',
        waist_inhale_circumference: 'Талия при вдохе',
        fat_percentage: 'Жир', skeletal_mass_percentage: 'Скелетная масса', muscle_dynamics: 'Мышечная динамика',
        body_water: 'Вода', protein: 'Белок', fat_content: 'Жировое содержание',
        machine_weight: 'Максимальный вес'
      }
      return map[key] || key;
    }
  }
};
</script>

<style scoped>
.measure-top {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.date-field {
  width: min(260px, 100%);
  margin: 0;
}

.progress-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  color: var(--tt-brand-deep);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
}

.progress-link:hover .tt-arrow {
  transform: translateX(4px);
}

.progress-link .tt-arrow {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Вкладок много, и на узком экране они переносятся: пилюля стала бы овалом */
.tabs {
  margin-top: 20px;
  border-radius: var(--tt-radius-lg);
}

/* Сколько полей вкладки уже заполнено */
.filled-badge {
  display: grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: var(--tt-radius-pill);
  background-color: var(--tt-brand-tint);
  color: var(--tt-brand-deep);
  font-size: 11px;
  font-weight: 700;
}

.tt-segment button.is-active .filled-badge {
  background-color: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.fields {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
  margin-top: 22px;
}

.measure-field {
  display: grid;
  gap: 8px;
  padding: 14px;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  animation: field-rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 40ms);
}

.measure-field:focus-within {
  border-color: var(--tt-brand);
  box-shadow: 0 0 0 4px rgba(248, 80, 10, 0.12);
}

@keyframes field-rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

.measure-label {
  color: var(--tt-soft);
  font-size: 14px;
  font-weight: 600;
}

.measure-input {
  position: relative;
  display: block;
}

.measure-input .tt-input {
  height: 46px;
  padding-right: 52px;
  background-color: var(--tt-surface);
  font-size: 17px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.measure-input .tt-input:focus {
  box-shadow: none;
}

.unit {
  position: absolute;
  top: 50%;
  right: 14px;
  color: var(--tt-muted);
  font-size: 13px;
  font-weight: 600;
  transform: translateY(-50%);
  pointer-events: none;
}

.measure-bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--tt-line);
}

.filled-total {
  color: var(--tt-muted);
  font-size: 14px;
}

.filled-total b {
  color: var(--tt-brand-deep);
}

.tt-note {
  margin: 16px 0 0;
}

@media (max-width: 640px) {
  .tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tabs button {
    padding: 0 10px;
  }

  .measure-bottom .tt-btn {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .measure-field {
    animation: none;
  }
}
</style>
