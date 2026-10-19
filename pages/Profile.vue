<template>
    <div class="tt-page">
        <div class="tt-backdrop" aria-hidden="true"></div>
        <CabinetHeader />

        <main class="tt-main profile-main">
            <div v-if="user" class="tt-container profile">
                <aside class="profile-side">
                    <UserPanel :user="user" :role="role" :items="menuItems" :active="menu" @select="select" />
                </aside>

                <section class="profile-content" aria-labelledby="profile-title">
                    <!-- key пересоздаёт раздел, и он заново «всплывает» -->
                    <div :key="menu" class="tt-stagger">
                        <header class="section-head">
                            <span class="tt-eyebrow"><i :class="section.icon"></i> Профиль</span>
                            <h1 id="profile-title" class="tt-page-title">{{ section.title }}</h1>
                            <p class="tt-page-lead">{{ section.lead }}</p>
                        </header>
                        <component :is="section.component" :user="user" @navigate="select" />
                    </div>
                </section>
            </div>
        </main>

        <CabinetFooter />
    </div>
</template>

<script>
import CabinetHeader from '@/components/common/Header.vue';
import CabinetFooter from '@/components/common/FooterLast.vue';
import UserPanel from '@/components/profile/UserPanel.vue';
import UserMenu from '@/components/profile/UserMenu.vue';
import TrainerMenu from '@/components/profile/TrainerMenu.vue';
import SettingsMenu from '@/components/profile/SettingsMenu.vue';
import SupportMenu from '@/components/profile/SupportMenu.vue';
import SubscriptionMenu from '@/components/profile/SubscriptionMenu.vue';
import CoachClients from '@/components/trainer/CoachClients.vue';
import CommentMenu from '@/components/profile/CommentMenu.vue';
import ChatMenu from '@/components/profile/ChatMenu.vue';
import { readCookie, readUser, safePush } from '@/components/utils/cabinet.js';

// Разделы профиля. Какой открыт — хранит адрес (?menu=progress): по таким
// ссылкам приходят помощник, шапка и подвал, и работает кнопка «назад»
const SECTIONS = {
    progress: {
        component: UserMenu, icon: 'fa-solid fa-chart-line', label: 'Мой прогресс', title: 'Мой прогресс',
        lead: 'Как изменились показатели с первого замера, графики по каждому из них и прогноз на месяц вперёд.'
    },
    trainer: {
        component: TrainerMenu, icon: 'fa-solid fa-user-tie', label: 'Мой тренер', title: 'Мой тренер',
        lead: 'Ваш тренер и все тренеры платформы — выбрать или сменить можно в один клик.'
    },
    subscription: {
        component: SubscriptionMenu, icon: 'fa-solid fa-crown', label: 'Подписка', title: 'Подписка',
        lead: 'Тарифы, оплата по QR-коду через СБП и остаток тренировок по текущей подписке.'
    },
    chat: {
        component: ChatMenu, icon: 'fa-solid fa-comments', label: 'Чат с тренером', title: 'Чат с тренером',
        lead: 'Вопросы о тренировках и питании — тренер ответит, как только освободится.'
    },
    clients: {
        component: CoachClients, icon: 'fa-solid fa-users', label: 'Мои клиенты', title: 'Мои клиенты',
        lead: 'Контакты и прогресс каждого клиента — откройте карточку, чтобы увидеть изменения.'
    },
    settings: {
        component: SettingsMenu, icon: 'fa-solid fa-gear', label: 'Настройки', title: 'Настройки',
        lead: 'Личные данные, фото профиля и ограничения по здоровью.'
    },
    support: {
        component: SupportMenu, icon: 'fa-solid fa-headset', label: 'Поддержка', title: 'Поддержка',
        lead: 'Ответы на частые вопросы и контакты фитнес-центра.'
    },
    feedback: {
        component: CommentMenu, icon: 'fa-solid fa-star', label: 'Отзыв', title: 'Оставить отзыв',
        lead: 'Расскажите, что нравится и что стоит улучшить, — отзыв придёт команде на почту.'
    }
};

const ORDER = {
    client: ['progress', 'trainer', 'subscription', 'chat', 'settings', 'support', 'feedback'],
    trainer: ['clients', 'chat', 'settings', 'support']
};

// У тренера чат — с клиентами, а в настройках нет блока здоровья
const TRAINER_OVERRIDES = {
    chat: {
        label: 'Чат с клиентами', title: 'Чат с клиентами',
        lead: 'Выберите клиента — откроется переписка с ним.'
    },
    settings: {
        lead: 'Личные данные, фото профиля, специализация и опыт — их видят клиенты, когда выбирают тренера.'
    }
};

export default {
    components: { CabinetHeader, CabinetFooter, UserPanel },
    data() {
        return {
            user: null,
            accountType: null
        };
    },
    computed: {
        // В cookie нет поля role: смотрим на accountType, а без него — на coachid
        role() {
            if (this.accountType === 'trainer' || (this.user && this.user.coachid)) return 'trainer';
            return 'client';
        },
        menuItems() {
            return ORDER[this.role].map(key => this.sectionOf(key));
        },
        menu() {
            const fromQuery = this.$route.query.menu;
            return ORDER[this.role].includes(fromQuery) ? fromQuery : ORDER[this.role][0];
        },
        section() {
            return this.sectionOf(this.menu);
        }
    },
    // См. ClientPage: cookie читаем только после монтирования, иначе ломается гидрация
    mounted() {
        this.user = readUser();
        this.accountType = readCookie('accountType');
        if (!this.user) this.$router.push('/');
    },
    methods: {
        sectionOf(key) {
            const overrides = this.role === 'trainer' ? TRAINER_OVERRIDES[key] : null;
            return { key, ...SECTIONS[key], ...overrides };
        },
        // extra — дополнительные параметры: например, с каким клиентом открыть чат
        select(key, extra = {}) {
            if (key === this.menu && !Object.keys(extra).length) return;
            safePush(this.$router, { path: '/Profile', query: { menu: key, ...extra } });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
};
</script>

<style scoped>
.profile-main {
    padding-top: 36px;
}

.profile {
    display: grid;
    grid-template-columns: 290px minmax(0, 1fr);
    align-items: start;
    gap: 36px;
}

.profile-side {
    position: sticky;
    top: 104px;
}

.profile-content {
    min-width: 0;
}

.section-head {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 28px;
}

@media (max-width: 1000px) {
    .profile {
        grid-template-columns: minmax(0, 1fr);
        gap: 24px;
    }

    .profile-side {
        position: static;
    }
}

@media (max-width: 640px) {
    .profile-main {
        padding-top: 20px;
    }

    .section-head {
        margin-bottom: 20px;
    }
}
</style>
