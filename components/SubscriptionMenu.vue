<template>
  <div class="subscription-container">
    <!-- Тарифы -->
    <div class="plans">
      <div
        v-for="(plan, index) in plans"
        :key="index"
        :class="['plan-card', { active: currentSubscription?.tariff === plan.code }]"
      >
        <h2 class="plan-title">{{ plan.name }}</h2>
        <p class="plan-desc">{{ plan.description }}</p>
        <h3 class="plan-price">{{ plan.price }} ₽ / мес</h3>
        <ul class="features">
          <li v-for="(feature, i) in plan.features" :key="i">✅ {{ feature }}</li>
        </ul>
        <button class="subscribe-btn" @click="showQR(plan)">Оформить</button>
      </div>
    </div>

    <!-- Информация о подписке -->
    <div class="subscription-status" v-if="currentSubscription">
      <p><strong>Статус подписки:</strong> {{ isActive(currentSubscription) ? 'активна' : 'неактивна' }}</p>
      <p><strong>Тариф:</strong> {{ getPlanName(currentSubscription.tariff) }}</p>
      <p><strong>Период:</strong> с {{ formatDate(currentSubscription.start_date) }} по {{ formatDate(currentSubscription.end_date) }}</p>
      <p><strong>Осталось тренировок:</strong> {{ currentSubscription.training_sessions - currentSubscription.used_training_sessions }}</p>
    </div>

    <!-- Модалка с QR -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <h2>Оплата тарифа {{ selectedPlan.name }}</h2>
        <p>Сумма: {{ selectedPlan.price }} ₽</p>
        <p>Отсканируйте QR-код СБП для оплаты:</p>
        <img :src="qrCodeUrl" alt="QR СБП" />
        <button class="confirm-btn" @click="confirmPayment">Я оплатил(а)</button>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode';

export default {
  data() {
    return {
      plans: [
        {
          code: "basic",
          name: "Базовый",
          description: "Стартовый план для начинающих",
          price: 999,
          training_sessions: 7,
          features: [
            "1 тренировка в неделю",
            "Групповые занятия",
            "1 онлайн-консультация/мес",
            "Общий чат",
            "План питания"
          ]
        },
        {
          code: "standard",
          name: "Стандарт",
          description: "Оптимальный выбор для регулярных тренировок",
          price: 1999,
          training_sessions: 10,
          features: [
            "2 тренировки в неделю",
            "Кардио и групповые занятия",
            "Индивидуальный план",
            "1 консультация нутрициолога",
            "Бесплатная вода"
          ]
        },
        {
          code: "premium",
          name: "Премиум",
          description: "Для тех, кто хочет максимум",
          price: 2999,
          training_sessions: 15,
          features: [
            "3 тренировки в неделю",
            "Индивидуальное питание",
            "Личный тренер",
            "Сауна и бассейн",
            "Поддержка 24/7"
          ]
        }
      ],
      currentSubscription: null,
      clientId: null,
      showModal: false,
      selectedPlan: null,
      qrCodeUrl: ''
    };
  },
  methods: {
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString("ru-RU");
    },
    getPlanName(code) {
      const plan = this.plans.find(p => p.code === code);
      return plan ? plan.name : "Неизвестно";
    },
    isActive(sub) {
      return new Date(sub.end_date) >= new Date();
    },
    async fetchSubscription() {
      const cookies = document.cookie.split("; ").reduce((acc, c) => {
        const [key, val] = c.split("=");
        acc[key] = decodeURIComponent(val);
        return acc;
      }, {});
      const user = JSON.parse(cookies.user || "{}");
      if (!user.clientid) return;
      this.clientId = user.clientid;
      const res = await fetch(`http://26.100.29.243:3000/api/clients/${this.clientId}/subscription`);
      this.currentSubscription = await res.json();
    },
    async showQR(plan) {
      this.selectedPlan = plan;
      const sbpUrl = `https://qr.nspk.ru/proxyapp/c2bpayment?QrType=01&BankID=100000000007&PayeeID=RUS79085010840&Amount=${plan.price * 100}&Purpose=${encodeURIComponent('Оплата тарифа TT')}`;
      this.qrCodeUrl = await QRCode.toDataURL(sbpUrl);
      this.showModal = true;
    },
    async confirmPayment() {
      if (!this.clientId || !this.selectedPlan) return;

      const now = new Date();
      const end = new Date();
      end.setMonth(now.getMonth() + 1);

      const payload = {
        tariff: this.selectedPlan.code,
        tariff_type: "месяц",
        training_sessions: this.selectedPlan.training_sessions,
        amount: this.selectedPlan.price,
        start_date: now.toISOString().split("T")[0],
        end_date: end.toISOString().split("T")[0],
        client_id: this.clientId
      };

      await fetch(`http://26.100.29.243:3000/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      this.showModal = false;
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
  gap: 20px;
  color: var(--text-color);
  width: 100%;
}

.plans {
  display: flex;
  justify-content: center;
  gap: 20px;
  width: 100%;
}

.plan-card {
  background: var(--background-color-white);
  border-radius: 10px;
  padding: 20px;
  width: 250px;
  border: 2px solid transparent;
  transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
}

.plan-card:nth-child(2) {
  transform: scale(1.05);
  z-index: 2;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

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
  color: #aaa;
  margin-bottom: 10px;
}

.plan-price {
  font-size: 22px;
  margin: 10px 0;
}

.features {
  list-style: none;
  padding: 0;
  margin-bottom: 15px;
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
  background: var(--background-color-white);
  padding: 15px;
  border-radius: 10px;
  font-size: 14px;
  min-width: 230px;
  max-width: 300px;
  color: var(--text-color);
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 300px;
  text-align: center;
  position: relative;
}
</style>
