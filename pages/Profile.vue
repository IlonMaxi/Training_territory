<template>
    <div class="profile-page">
        <!-- Хедер -->
        <Header />

        <div class="profile-container">
            <div class="profile-main">
                <transition name="fade" mode="out-in">
                    <component :is="selectedComponent" :user="user" @menu-selected="changeLeftComponent" />
                </transition>
            </div>

            <div class="profile-side">
                <UserPanel v-if="user" :user="user" @menu-selected="changeLeftComponent" />
            </div>
        </div>
    </div>
</template>

<script>
import Header from "@/components/common/Header.vue";
import UserMenu from "@/components/profile/UserMenu.vue";
import UserPanel from "@/components/profile/UserPanel.vue";
import TrainerMenu from "@/components/profile/TrainerMenu.vue";
import SettingsMenu from "@/components/profile/SettingsMenu.vue";
import SupportMenu from "@/components/profile/SupportMenu.vue";
import SubscriptionMenu from "@/components/profile/SubscriptionMenu.vue";
import CoachClients from "@/components/trainer/CoachClients.vue";
import CommentMenu from "@/components/profile/CommentMenu.vue";
import ChatMenu from "@/components/profile/ChatMenu.vue";

export default {
    components: {
        Header,
        UserMenu,
        UserPanel,
        TrainerMenu,
        SettingsMenu,
        SupportMenu,
        SubscriptionMenu,
        CoachClients,
        CommentMenu,
        ChatMenu
    },
    data() {
        return {
            user: null,
            accountType: null,
            selectedComponent: null
        };
    },
    mounted() {
        this.loadUserData();
    },
    watch: {
        // Помощник переходит на /Profile?menu=progress; при переходе внутри
        // той же страницы компонент не пересоздаётся, поэтому следим за query
        '$route.query.menu'(menu) {
            if (menu) this.changeLeftComponent(menu);
        }
    },
    methods: {
        loadUserData() {
            if (typeof document !== "undefined") {
                const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
                    const [key, value] = cookie.split("=");
                    acc[key] = decodeURIComponent(value);
                    return acc;
                }, {});
                if (cookies.user) {
                    this.user = JSON.parse(cookies.user);
                    this.accountType = cookies.accountType || null;
                    this.setDefaultComponent();
                }
            }
        },
        setDefaultComponent() {
            // Раздел из ссылки имеет приоритет — по нему приходит помощник
            const fromQuery = this.$route.query.menu;
            if (fromQuery) {
                this.changeLeftComponent(fromQuery);
                return;
            }

            // В cookie у пользователя нет поля role — роль определяем
            // по accountType, а если её нет, то по наличию coachid
            const isCoach = this.accountType === "trainer" || !!this.user.coachid;
            this.selectedComponent = isCoach ? CoachClients : UserMenu;
        },
        changeLeftComponent(menuItem) {
            const componentMap = {
                progress: UserMenu,
                trainer: TrainerMenu,
                settings: SettingsMenu,
                support: SupportMenu,
                subscription: SubscriptionMenu,
                clients: CoachClients,
                feedback: CommentMenu,
                chat: ChatMenu
            };

            this.selectedComponent = componentMap[menuItem] || UserMenu;
        }
    }
};
</script>

<style scoped>
.profile-page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: var(--background-color);
    color: var(--text-color);
    transition: background-color 0.5s ease, color 0.5s ease;
}

.profile-container {
    display: flex;
    align-items: flex-start;
    gap: 24px;
    padding: 20px 24px;
    width: 100%;
    margin: 0 auto;
}

.profile-main {
    flex: 1 1 auto;
    min-width: 0;
}

.profile-side {
    flex: 0 0 280px;
}

/* Плавная анимация появления/исчезновения */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
