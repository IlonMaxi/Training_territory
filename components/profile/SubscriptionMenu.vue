<template>
  <div class="subscription">
    <!-- Текущая подписка -->
    <div v-if="loading" class="tt-skeleton status-skeleton"></div>

    <article v-else-if="currentSubscription" class="tt-dark status">
      <div class="sessions-ring" role="img" :aria-label="`Осталось ${remaining} из ${total} тренировок`">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle class="ring-track" cx="60" cy="60" r="50" />
          <circle class="ring-fill" cx="60" cy="60" r="50" pathLength="100"
            :style="{ strokeDasharray: `${remainingShare * 100} 100` }" />
        </svg>
        <div class="ring-text">
          <b>{{ remaining }}</b>
          <span>из {{ total }}</span>
        </div>
      </div>

      <div class="status-info">
        <div class="status-top">
          <span class="status-plan"><i :class="planOf(currentSubscription.tariff).icon"></i>
            {{ getPlanName(currentSubscription.tariff) }}</span>
          <span :class="['status-chip', { 'is-off': !isActive(currentSubscription) }]">
            <span class="status-dot"></span>{{ isActive(currentSubscription) ? 'Активна' : 'Неактивна' }}
          </span>
        </div>
        <p class="status-caption">{{ sessionsWord(remaining) }} осталось по подписке</p>

        <div class="period">
          <div class="period-dates">
            <span>с {{ formatDate(currentSubscription.start_date) }}</span>
            <span>по {{ formatDate(currentSubscription.end_date) }}</span>
          </div>
          <div class="period-track"><span :style="{ '--done': periodShare }"></span></div>
          <span class="period-left">{{ daysLeftLabel }}</span>
        </div>
      </div>
    </article>

    <div v-else class="tt-dark status status--empty">
      <span class="tt-icon-tile tt-icon-tile--lg tt-icon-tile--solid"><i class="fa-solid fa-crown"></i></span>
      <div>
        <h3>Подписки пока нет</h3>
        <p>Выберите тариф ниже — оплата по QR-коду через СБП, подписка включится сразу.</p>
      </div>
    </div>

    <p v-if="notice" class="tt-note tt-note--ok" role="status"><i class="fa-solid fa-circle-check"></i> {{ notice }}</p>
    <p v-if="error" class="tt-note tt-note--error" role="alert"><i class="fa-solid fa-circle-exclamation"></i> {{ error }}</p>

    <!-- Тарифы -->
    <div class="plans">
      <article v-for="(plan, index) in plans" :key="plan.code"
        :class="['tt-card', 'tt-card--lift', 'plan', 'tt-stagger', { 'plan--featured': plan.featured, 'is-current': isCurrentPlan(plan) }]"
        :style="{ '--i': index }">
        <span v-if="plan.featured" class="plan-ribbon">Популярный</span>
        <span :class="['tt-icon-tile', { 'tt-icon-tile--solid': plan.featured }]"><i :class="plan.icon"></i></span>
        <h3 class="plan-name">{{ plan.name }}</h3>
        <p class="plan-desc">{{ plan.description }}</p>
        <div class="plan-price">
          <b>{{ formatPrice(plan.price) }}</b>
          <span>₽ / мес</span>
        </div>
        <span class="plan-sessions"><i class="fa-solid fa-dumbbell"></i> {{ plan.training_sessions }} тренировок</span>
        <ul class="plan-features">
          <li v-for="feature in plan.features" :key="feature"><i class="fa-solid fa-check"></i> {{ feature }}</li>
        </ul>
        <button type="button" :class="['tt-btn', 'plan-btn', plan.featured ? 'tt-btn--primary' : 'tt-btn--ghost']"
          @click="showQR(plan)">
          {{ isCurrentPlan(plan) ? 'Продлить' : 'Оформить' }} <span class="tt-arrow" aria-hidden="true">→</span>
        </button>
      </article>
    </div>

    <!-- Оплата по QR -->
    <transition name="tt-modal" :duration="{ enter: 450, leave: 200 }">
      <div v-if="showModal && selectedPlan" class="tt-modal-overlay" @click.self="closeModal">
        <div class="tt-modal pay" role="dialog" aria-modal="true" aria-labelledby="pay-title">
          <button type="button" class="tt-modal-close" aria-label="Закрыть" @click="closeModal">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <span class="tt-eyebrow"><i class="fa-solid fa-qrcode"></i> Оплата через СБП</span>
          <h2 id="pay-title" class="tt-modal-title">Тариф «{{ selectedPlan.name }}»</h2>

          <div class="pay-body">
            <div class="qr-frame">
              <img :src="qrCodeUrl" alt="QR-код для оплаты через СБП" />
              <span class="qr-scan" aria-hidden="true"></span>
            </div>
            <div class="pay-info">
              <div class="pay-sum">
                <span>К оплате</span>
                <b>{{ formatPrice(selectedPlan.price) }} ₽</b>
              </div>
              <ol class="pay-steps">
                <li>Откройте приложение банка</li>
                <li>Выберите оплату по QR-коду</li>
                <li>Наведите камеру на код и подтвердите платёж</li>
              </ol>
            </div>
          </div>

          <button type="button" class="tt-btn tt-btn--primary pay-btn" :disabled="paying" @click="confirmPayment">
            <i v-if="paying" class="fa-solid fa-spinner fa-spin"></i>
            {{ paying ? 'Подключаю…' : 'Я оплатил(а)' }}
          </button>
          <p v-if="payError" class="tt-form-error pay-error"><i class="fa-solid fa-circle-exclamation"></i> {{ payError }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import QRCode from 'qrcode';
import { readUser } from '@/components/utils/cabinet.js';
import { plural } from '@/components/utils/format.js';

const DAY = 24 * 60 * 60 * 1000;

export default {
  name: 'SubscriptionMenu',
  data() {
    return {
      plans: [
        {
          code: 'basic',
          name: 'Базовый',
          icon: 'fa-solid fa-person-running',
          description: 'Стартовый план для начинающих',
          price: 999,
          training_sessions: 7,
          features: [
            '1 тренировка в неделю',
            'Групповые занятия',
            '1 онлайн-консультация в месяц',
            'Общий чат',
            'План питания'
          ]
        },
        {
          code: 'standard',
          name: 'Стандарт',
          icon: 'fa-solid fa-bolt',
          featured: true,
          description: 'Оптимальный выбор для регулярных тренировок',
          price: 1999,
          training_sessions: 10,
          features: [
            '2 тренировки в неделю',
            'Кардио и групповые занятия',
            'Индивидуальный план',
            '1 консультация нутрициолога',
            'Бесплатная вода'
          ]
        },
        {
          code: 'premium',
          name: 'Премиум',
          icon: 'fa-solid fa-crown',
          description: 'Для тех, кто хочет максимум',
          price: 2999,
          training_sessions: 15,
          features: [
            '3 тренировки в неделю',
            'Индивидуальное питание',
            'Личный тренер',
            'Сауна и бассейн',
            'Поддержка 24/7'
          ]
        }
      ],
      currentSubscription: null,
      loading: true,
      clientId: null,
      showModal: false,
      selectedPlan: null,
      qrCodeUrl: '',
      paying: false,
      payError: null,
      notice: null,
      error: null
    };
  },
  computed: {
    total() {
      return Number(this.currentSubscription && this.currentSubscription.training_sessions) || 0;
    },
    remaining() {
      const used = Number(this.currentSubscription && this.currentSubscription.used_training_sessions) || 0;
      return Math.max(0, this.total - used);
    },
    remainingShare() {
      return this.total ? this.remaining / this.total : 0;
    },
    // Сколько периода подписки уже прошло — для полоски
    periodShare() {
      const sub = this.currentSubscription;
      if (!sub) return 0;
      const start = new Date(sub.start_date).getTime();
      const end = new Date(sub.end_date).getTime();
      if (!(end > start)) return 1;
      return Math.min(1, Math.max(0, (Date.now() - start) / (end - start)));
    },
    daysLeftLabel() {
      const sub = this.currentSubscription;
      if (!sub) return '';
      const days = Math.ceil((new Date(sub.end_date).getTime() - Date.now()) / DAY);
      if (days < 0) return 'Срок истёк';
      if (days === 0) return 'Последний день';
      return `Ещё ${days} ${plural(days, ['день', 'дня', 'дней'])}`;
    }
  },
  mounted() {
    this.fetchSubscription();
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.onKeydown);
    clearTimeout(this.noticeTimer);
  },
  methods: {
    sessionsWord(n) {
      return plural(n, ['Тренировка', 'Тренировки', 'Тренировок']);
    },
    planOf(code) {
      return this.plans.find(plan => plan.code === code) || { name: 'Неизвестно', icon: 'fa-solid fa-ticket' };
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('ru-RU');
    },
    formatPrice(price) {
      return price.toLocaleString('ru-RU');
    },
    getPlanName(code) {
      return this.planOf(code).name;
    },
    isActive(sub) {
      return new Date(sub.end_date) >= new Date();
    },
    isCurrentPlan(plan) {
      return Boolean(this.currentSubscription && this.currentSubscription.tariff === plan.code);
    },
    async fetchSubscription() {
      const user = readUser();
      if (!user || !user.clientid) {
        this.loading = false;
        return;
      }
      this.clientId = user.clientid;
      try {
        const response = await fetch(`/api/clients/${this.clientId}/subscription`);
        const data = response.ok ? await response.json() : null;
        // Нет активной подписки — сервер отвечает null
        this.currentSubscription = data && data.tariff ? data : null;
      } catch (error) {
        console.error('Не удалось загрузить подписку:', error);
        this.error = 'Не удалось загрузить подписку. Проверьте соединение.';
      } finally {
        this.loading = false;
      }
    },
    async showQR(plan) {
      this.selectedPlan = plan;
      this.payError = null;
      const sbpUrl = `https://qr.nspk.ru/proxyapp/c2bpayment?QrType=01&BankID=100000000007&PayeeID=RUS79085010840&Amount=${plan.price * 100}&Purpose=${encodeURIComponent('Оплата тарифа TT')}`;
      this.qrCodeUrl = await QRCode.toDataURL(sbpUrl, {
        margin: 1,
        width: 320,
        color: { dark: '#0f1427', light: '#ffffff' }
      });
      this.showModal = true;
      document.addEventListener('keydown', this.onKeydown);
    },
    closeModal() {
      if (this.paying) return;
      this.showModal = false;
      document.removeEventListener('keydown', this.onKeydown);
    },
    onKeydown(event) {
      if (event.key === 'Escape') this.closeModal();
    },
    async confirmPayment() {
      if (!this.clientId || !this.selectedPlan || this.paying) return;
      this.paying = true;
      this.payError = null;

      const now = new Date();
      const end = new Date();
      end.setMonth(now.getMonth() + 1);

      const payload = {
        tariff: this.selectedPlan.code,
        tariff_type: 'месяц',
        training_sessions: this.selectedPlan.training_sessions,
        amount: this.selectedPlan.price,
        start_date: now.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        client_id: this.clientId
      };

      try {
        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Не удалось подключить подписку. Попробуйте ещё раз.');

        const name = this.selectedPlan.name;
        this.paying = false;
        this.closeModal();
        await this.fetchSubscription();
        this.notice = `Тариф «${name}» подключён`;
        clearTimeout(this.noticeTimer);
        this.noticeTimer = setTimeout(() => { this.notice = null; }, 5000);
      } catch (error) {
        this.payError = error.message === 'Failed to fetch'
          ? 'Нет связи с сервером. Проверьте соединение.'
          : error.message;
      } finally {
        this.paying = false;
      }
    }
  }
};
</script>

<style scoped>
.subscription {
  display: grid;
  gap: 24px;
}

.status-skeleton {
  height: 190px;
  border-radius: var(--tt-radius-xl);
}

/* ---------- текущая подписка ----------
   Класс не .ring: так называется утилита Tailwind, она рисует синюю обводку */

/* Фон, свечение и скругление — от .tt-dark */
.status {
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 26px 28px;
}

.sessions-ring {
  position: relative;
  flex: none;
  width: 132px;
  height: 132px;
}

.sessions-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-track,
.ring-fill {
  fill: none;
  stroke-width: 10;
}

.ring-track {
  stroke: rgba(255, 255, 255, 0.1);
}

/* Дуга дорисовывается до доли оставшихся тренировок */
.ring-fill {
  stroke: #ff7a3d;
  stroke-linecap: round;
  animation: ring-draw 1.2s var(--tt-ease) both;
}

@keyframes ring-draw {
  from {
    stroke-dasharray: 0 100;
  }
}

.ring-text {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  text-align: center;
}

.ring-text b {
  font-size: 38px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.ring-text span {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
}

.status-info {
  display: grid;
  flex: 1 1 auto;
  gap: 10px;
  min-width: 0;
}

.status-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
}

.status-plan {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.status-plan i {
  color: #ff7a3d;
  font-size: 20px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: var(--tt-radius-pill);
  background-color: rgba(52, 211, 153, 0.15);
  color: #6ee7b7;
  font-size: 13px;
  font-weight: 600;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
}

.status-chip.is-off {
  background-color: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
}

.status-caption {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
}

.period {
  display: grid;
  gap: 8px;
  max-width: 460px;
  margin-top: 6px;
}

.period-dates {
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
}

.period-track {
  height: 8px;
  overflow: hidden;
  border-radius: var(--tt-radius-pill);
  background-color: rgba(255, 255, 255, 0.1);
}

.period-track span {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: var(--tt-radius-pill);
  background: linear-gradient(90deg, #7c9bff, #3760e7);
  transform: scaleX(var(--done, 0));
  transform-origin: 0 50%;
  animation: period-grow 1.2s var(--tt-ease) both;
}

@keyframes period-grow {
  from {
    transform: scaleX(0);
  }
}

.period-left {
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}

.status--empty {
  gap: 18px;
  padding: 24px;
}

.status--empty h3 {
  margin: 0 0 4px;
  font-size: 22px;
}

.status--empty p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  line-height: 1.55;
}

/* ---------- тарифы ---------- */

.plans {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 16px;
}

/* Карточка — .tt-card: рамка, тень, подъём и заливка иконки при наведении */
.plan {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 26px 22px 22px;
}

/* Популярный тариф — с оранжевой обводкой-градиентом */
.plan--featured {
  border: 2px solid transparent;
  background:
    linear-gradient(var(--tt-surface), var(--tt-surface)) padding-box,
    linear-gradient(160deg, #ffb48a, #f8500a 60%, #c2410c) border-box;
  box-shadow: 0 26px 50px -26px rgba(248, 80, 10, 0.55);
}

.plan.is-current::after {
  content: "Ваш тариф";
  position: absolute;
  top: 18px;
  right: 18px;
  padding: 3px 10px;
  border-radius: var(--tt-radius-pill);
  background-color: var(--tt-blue-tint);
  color: var(--tt-blue-deep);
  font-size: 12px;
  font-weight: 700;
}

.plan-ribbon {
  position: absolute;
  top: -13px;
  left: 22px;
  padding: 5px 12px;
  border-radius: var(--tt-radius-pill);
  background: var(--tt-gradient-brand);
  box-shadow: 0 10px 20px -10px rgba(248, 80, 10, 0.9);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.plan-name {
  margin: 4px 0 0;
  color: var(--tt-ink);
  font-size: 22px;
  font-weight: 700;
}

.plan-desc {
  min-height: 2.9em;
  margin: 0;
  color: var(--tt-soft);
  font-size: 14px;
  line-height: 1.45;
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.plan-price b {
  color: var(--tt-ink);
  font-size: 40px;
  line-height: 1;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.plan-price span {
  color: var(--tt-muted);
  font-size: 15px;
}

.plan-sessions {
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: var(--tt-radius-pill);
  background-color: var(--tt-blue-tint);
  color: var(--tt-blue-deep);
  font-size: 13px;
  font-weight: 600;
}

.plan-features {
  display: grid;
  gap: 9px;
  margin: 4px 0 8px;
  padding: 14px 0 0;
  border-top: 1px solid var(--tt-line);
  list-style: none;
}

.plan-features li {
  display: flex;
  align-items: baseline;
  gap: 10px;
  color: var(--tt-soft);
  font-size: 14px;
  line-height: 1.4;
}

.plan-features i {
  color: var(--tt-brand);
  font-size: 12px;
}

.plan-btn {
  width: 100%;
  margin-top: auto;
}

/* ---------- окно оплаты ---------- */

.pay {
  width: min(600px, 100%);
}

.pay-body {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  align-items: center;
  gap: 24px;
}

.qr-frame {
  position: relative;
  padding: 12px;
  overflow: hidden;
  border: 2px solid var(--tt-line-brand);
  border-radius: var(--tt-radius-lg);
  background-color: #ffffff;
}

.qr-frame img {
  display: block;
  width: 100%;
  height: auto;
}

/* Линия «сканера» бегает по коду */
.qr-scan {
  position: absolute;
  right: 12px;
  left: 12px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, #f8500a, transparent);
  box-shadow: 0 0 12px rgba(248, 80, 10, 0.8);
  animation: qr-scan 2.4s ease-in-out infinite;
}

@keyframes qr-scan {

  0%,
  100% {
    top: 14px;
  }

  50% {
    top: calc(100% - 16px);
  }
}

.pay-info {
  display: grid;
  gap: 18px;
}

.pay-sum {
  display: grid;
  gap: 2px;
}

.pay-sum span {
  color: var(--tt-muted);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.pay-sum b {
  color: var(--tt-ink);
  font-size: 36px;
  letter-spacing: -0.02em;
}

.pay-steps {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: step;
}

.pay-steps li {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--tt-soft);
  font-size: 14px;
  line-height: 1.4;
  counter-increment: step;
}

.pay-steps li::before {
  content: counter(step);
  display: grid;
  flex: none;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: var(--tt-brand-tint);
  color: var(--tt-brand-deep);
  font-size: 13px;
  font-weight: 700;
}

.pay-btn {
  width: 100%;
  margin-top: 24px;
}

.pay-error {
  margin: 14px 0 0;
}

@media (max-width: 1100px) {
  .plans {
    grid-template-columns: minmax(0, 1fr);
    max-width: 520px;
  }

  .plan-desc {
    min-height: 0;
  }
}

@media (max-width: 640px) {
  .status {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding: 22px;
  }

  .pay-body {
    grid-template-columns: minmax(0, 1fr);
    justify-items: center;
  }

  .qr-frame {
    width: min(240px, 100%);
  }
}

@media (prefers-reduced-motion: reduce) {

  .ring-fill,
  .period-track span,
  .qr-scan {
    animation: none;
  }
}
</style>
