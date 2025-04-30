<template>
    <div class="subscription-container">
        <!-- Тарифы -->
        <div class="plans">
            <div v-for="(plan, index) in plans" :key="index"
                :class="['plan-card', { active: user?.subscription?.plan === plan.id }]">
                <h2 class="plan-title">{{ plan.name }}</h2>
                <p class="plan-desc">{{ plan.description }}</p>
                <h3 class="plan-price">${{ plan.price }}/mo</h3>
                <ul class="features">
                    <li v-for="(feature, i) in plan.features" :key="i">
                        ✅ {{ feature }}
                    </li>
                </ul>
                <button class="subscribe-btn">Оформить</button>
            </div>
        </div>

        <!-- Информация о подписке -->
        <div class="subscription-status" v-if="user?.subscription">
            <p><strong>Статус подписки:</strong> {{ user.subscription.active ? 'активная' : 'неактивна' }}</p>
            <p><strong>Тариф:</strong> {{ getPlanName(user.subscription.plan) }}</p>
            <p>
                <strong>с {{ formatDate(user.subscription.start) }} по {{ formatDate(user.subscription.end) }}</strong>
            </p>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        user: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            plans: [
                {
                    id: "basic",
                    name: "Базовый",
                    description: "Для новичков фитнес центра",
                    price: "999",
                    features: [
                        "Одна заявка за раз",
                        "Дизайн спринт 2 недели",
                        "Неограниченные правки",
                        "1 встреча в неделю",
                        "Файлы Figma для dev",
                        "Доступ к фотостокам"
                    ]
                },
                {
                    id: "premium",
                    name: "Премиум",
                    description: "Профессиональный план",
                    price: "2999",
                    features: [
                        "1 заявка за раз",
                        "3-5 рабочих дней доставка",
                        "Неограниченные правки",
                        "1 встреча в неделю",
                        "Файлы Figma для dev",
                        "Доступ к фотостокам"
                    ]
                },
                {
                    id: "standard",
                    name: "Стандарт",
                    description: "План для всех",
                    price: "3499",
                    features: [
                        "2 заявки одновременно",
                        "3-5 рабочих дней доставка",
                        "Неограниченные правки",
                        "Гибкие встречи",
                        "Файлы Figma для dev",
                        "Доступ к фотостокам"
                    ]
                }
            ]
        };
    },
    methods: {
        getPlanName(id) {
            const plan = this.plans.find(p => p.id === id);
            return plan ? plan.name : "Неизвестно";
        },
        formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString("ru-RU");
        }
    }
};
</script>

<style scoped>
.subscription-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* Центрирование по ширине */
  gap: 20px;
  color: var(--text-color);
  transition: color 0.5s, background-color 0.5s;
  width: 100%;
}

.plans {
  display: flex;
  justify-content: center;
  gap: 20px;
  width: 100%;
  position: relative;
}

.plan-card {
  background: var(--background-color-white);
  border-radius: 10px;
  padding: 20px;
  width: 250px;
  color: var(--text-color);
  border: 2px solid transparent;
  transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
  z-index: 1;
}

/* Средняя карточка (вторая по счёту) — увеличенная */
.plan-card:nth-child(2) {
  transform: scale(1.1);
  z-index: 2;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* Подсветка активной карточки */
.plan-card.active {
  border-color: var(--button-hover-color);
  box-shadow: 0 0 12px var(--button-hover-color);
}

.plan-title {
  font-size: 20px;
  margin-bottom: 5px;
}

.plan-desc {
  font-size: 14px;
  color: #bbb;
  margin-bottom: 15px;
}

.plan-price {
  font-size: 24px;
  margin: 10px 0;
}

.features {
  list-style: none;
  padding: 0;
  font-size: 14px;
  margin-bottom: 20px;
}

.subscribe-btn {
  background: var(--button-hover-color);
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.subscription-status {
  background: #fff;
  color: var(--text-color);
  padding: 15px;
  border-radius: 10px;
  font-size: 14px;
  text-align: left;
  min-width: 230px;
  max-width: 300px;
}
</style>