<template>
  <div class="measurements-form">
    <h2 class="form-title">Ввод замеров</h2>

    <!-- Вкладки -->
    <div class="tab-buttons">
      <button :class="{ active: activeTab === 'unit' }" @click="activeTab = 'unit'">Единицы</button>
      <button :class="{ active: activeTab === 'kg' }" @click="activeTab = 'kg'">Килограммы</button>
      <button :class="{ active: activeTab === 'cm' }" @click="activeTab = 'cm'">Сантиметры</button>
      <button :class="{ active: activeTab === 'percentage' }" @click="activeTab = 'percentage'">Проценты</button>
      <button :class="{ active: activeTab === 'weight_machine' }" @click="activeTab = 'weight_machine'">Завершение</button>
    </div>

    <form @submit.prevent="submitMeasurements">
      <div class="form-group">
        <label>Дата:</label>
        <input type="date" v-model="form.date" required />
      </div>

      <!-- Шаблон вкладок -->
      <div v-if="activeTab === 'unit'">
        <h3>Единицы</h3>
        <div class="input-row">
          <div class="input-block" v-for="(val, key) in form.unit" :key="key">
            <label :for="key">{{ formatLabel(key) }}</label>
            <input :id="key" type="number" step="0.01" v-model="form.unit[key]" />
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'kg'">
        <h3>Килограммы</h3>
        <div class="input-row">
          <div class="input-block" v-for="(val, key) in form.kg" :key="key">
            <label :for="key">{{ formatLabel(key) }}</label>
            <input :id="key" type="number" step="0.01" v-model="form.kg[key]" />
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'cm'">
        <h3>Сантиметры</h3>
        <div class="input-row">
          <div class="input-block" v-for="(val, key) in form.cm" :key="key">
            <label :for="key">{{ formatLabel(key) }}</label>
            <input :id="key" type="number" step="0.01" v-model="form.cm[key]" />
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'percentage'">
        <h3>Проценты</h3>
        <div class="input-row">
          <div class="input-block" v-for="(val, key) in form.percentage" :key="key">
            <label :for="key">{{ formatLabel(key) }}</label>
            <input :id="key" type="number" step="0.01" v-model="form.percentage[key]" />
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'weight_machine'">
        <h3>Вес на тренажёре</h3>
        <div class="input-row">
          <div class="input-block">
            <label>Макс. вес:</label>
            <input type="number" step="0.01" v-model="form.weight_machine.machine_weight" />
          </div>
        </div>
        <button type="submit">Отправить замеры</button>
        <div v-if="error" class="error-message">{{ error }}</div>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'unit',
      error: null,
      form: {
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
      }
    }
  },
  computed: {
    clientId() {
      return this.$root.user?.clientid;
    }
  },
  methods: {
    async submitMeasurements() {
      try {
        const response = await fetch(`http://26.100.29.243:3000/api/clients/${this.clientId}/add-full-measurement`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        });
        if (!response.ok) throw new Error((await response.json()).error || 'Ошибка при отправке замеров');
        alert('Замеры успешно отправлены!');
        this.resetForm();
      } catch (error) {
        this.error = error.message;
      }
    },
    resetForm() {
      this.form = JSON.parse(JSON.stringify(this.$options.data().form));
    },
    formatLabel(key) {
      const map = {
        bmi: 'BMI', body_age: 'Возраст тела', metabolism: 'Метаболизм',
        weight: 'Вес' ,fat_mass: 'Жировая масса', skeletal_mass: 'Скелетная масса', muscle_mass: 'Мышцы',
        water_content: 'Содержание воды', bone_mass: 'Костная масса', lbm: 'LBM (масса без жира)',
        chest_circumference: 'Грудь', waist_circumference: 'Талия', hip_circumference: 'Бёдра',
        bicep_circumference: 'Бицепс', forearm_circumference: 'Предплечье', quadriceps_circumference: 'Квадрицепс',
        calf_circumference: 'Икра', thigh_circumference: 'Бедро', neck_circumference: 'Шея',
        waist_inhale_circumference: 'Талия при вдохе',
        fat_percentage: 'Жир %', skeletal_mass_percentage: 'Скелетная масса %', muscle_dynamics: 'Мышечная динамика',
        body_water: 'Вода %', protein: 'Белок %', fat_content: 'Жировое содержание'
      }
      return map[key] || key;
    }
  }
};
</script>

<style scoped>
.measurements-form {
  max-width: 850px;
  margin: 40px auto;
  padding: 30px;
  background-color: var(--background-color-white);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  color: var(--text-color);
  font-family: sans-serif;
}

.form-title {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--text-color);
}

.tab-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 25px;
  justify-content: center;
}

.tab-buttons button {
  padding: 10px 18px;
  background-color: var(--background-color);
  border: 1px solid var(--button-border-color);
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-color);
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab-buttons button.active {
  background-color: var(--button-hover-color);
  color: var(--button-hover-color-white);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 10px;
}

.input-block {
  flex: 1 1 calc(33.333% - 20px);
  min-width: 200px;
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 14px;
  color: var(--text-color);
}

input {
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid var(--button-border-color);
  background-color: var(--background-color);
  color: var(--text-color);
  font-size: 14px;
  transition: border 0.3s ease;
}

input:focus {
  outline: none;
  border-color: var(--button-hover-color);
  box-shadow: 0 0 0 2px rgba(255, 107, 77, 0.2);
}

button[type="submit"] {
  margin-top: 25px;
  width: 100%;
  padding: 14px;
  background-color: var(--button-hover-color);
  color: var(--button-hover-color-white);
  font-weight: bold;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover {
  background-color: #e04a2a;
}

.error-message {
  margin-top: 20px;
  text-align: center;
  color: red;
  font-size: 15px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .input-block {
    flex: 1 1 100%;
  }
  .tab-buttons {
    justify-content: flex-start;
  }
}
</style>
