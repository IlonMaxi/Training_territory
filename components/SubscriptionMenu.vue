<template>
    <div class="subscription-container">
        <!-- Тарифы -->
        <div class="plans">
            <div
                v-for="(plan, index) in plans"
                :key="index"
                :class="['plan-card', { active: currentSubscription?.tariff === plan.id }]"
            >
                <h2 class="plan-title">{{ plan.name }}</h2>
                <p class="plan-desc">{{ plan.description }}</p>
                <h3 class="plan-price">{{ plan.price }} ₽ / мес</h3>
                <ul class="features">
                    <li v-for="(feature, i) in plan.features" :key="i">✅ {{ feature }}</li>
                </ul>
                <button class="subscribe-btn" @click="subscribe(plan)">Оформить</button>
            </div>
        </div>

        <!-- Информация о подписке -->
        <div class="subscription-status" v-if="currentSubscription">
            <p><strong>Статус подписки:</strong> {{ isActive(currentSubscription) ? 'активна' : 'неактивна' }}</p>
            <p><strong>Тариф:</strong> {{ getPlanName(currentSubscription.tariff) }}</p>
            <p>
                <strong>с {{ formatDate(currentSubscription.start_date) }}
                    по {{ formatDate(currentSubscription.end_date) }}</strong>
            </p>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            plans: [
                {
                    code: "basic",
                    name: "Базовый",
                    description: "Стартовый план для начинающих",
                    price: 999,
                    training_sessions: 4,
                    features: [
                        "1 тренировка в неделю",
                        "Доступ к групповым занятиям",
                        "Онлайн-консультация тренера 1 раз/мес",
                        "Общий чат участников",
                        "Стартовый план питания"
                    ]
                },
                {
                    code: "standard",
                    name: "Стандарт",
                    description: "Оптимальный выбор для регулярных тренировок",
                    price: 1999,
                    training_sessions: 8,
                    features: [
                        "2 тренировки в неделю",
                        "Групповые и кардио-занятия",
                        "Индивидуальный план тренировок",
                        "1 консультация нутрициолога",
                        "Бесплатная вода и полотенце"
                    ]
                },
                {
                    code: "premium",
                    name: "Премиум",
                    description: "Для тех, кто хочет максимум",
                    price: 2999,
                    training_sessions: 12,
                    features: [
                        "3 тренировки в неделю",
                        "Индивидуальный план питания",
                        "Личный тренер",
                        "Доступ к сауне и бассейну",
                        "Поддержка 24/7",
                        "Персональные замеры тела ежемесячно"
                    ]
                }
            ],
            currentSubscription: null,
            clientId: null
        };
    },
    methods: {
        getPlanName(code) {
            const plan = this.plans.find(p => p.code === code);
            return plan ? plan.name : "Неизвестно";
        },
        formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString("ru-RU");
        },
        isActive(subscription) {
            const now = new Date();
            return new Date(subscription.end_date) >= now;
        },
        async fetchSubscription() {
            const cookies = document.cookie.split('; ').reduce((acc, c) => {
                const [key, val] = c.split('=');
                acc[key] = decodeURIComponent(val);
                return acc;
            }, {});
            const user = JSON.parse(cookies.user || '{}');
            if (!user.clientid) return;

            this.clientId = user.clientid;

            const res = await fetch(`http://26.100.29.243:3000/api/clients/${this.clientId}/subscription`);
            const data = await res.json();
            this.currentSubscription = data;
        },
        async subscribe(plan) {
            if (!this.clientId) return;

            const now = new Date();
            const end = new Date();
            end.setMonth(now.getMonth() + 1);

            const payload = {
                tariff: plan.code,
                tariff_type: 'месяц',
                training_sessions: plan.training_sessions,
                amount: plan.price,
                start_date: now.toISOString().split('T')[0],
                end_date: end.toISOString().split('T')[0],
                client_id: this.clientId
            };

            await fetch(`http://26.100.29.243:3000/api/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            this.fetchSubscription();
        }
    },
    mounted() {
        this.fetchSubscription();
    }
};
</script>

<style scoped>
.subscription-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* Центрирование по ширине */
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