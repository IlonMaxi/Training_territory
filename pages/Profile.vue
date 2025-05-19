<template>
    <div class="profile-page">
        <!-- Хедер -->
        <Header />

        <div class="profile-container">
            <!-- Левый динамический компонент -->
            <transition name="fade" mode="out-in">
                <component :is="selectedComponent" :user="user" @menu-selected="changeLeftComponent" />
            </transition>

            <!-- Правая панель с пользовательским меню -->
            <UserPanel v-if="user" :user="user" @menu-selected="changeLeftComponent" />
        </div>
    </div>
</template>

<script>
import Header from "@/components/Header.vue";
import UserMenu from "@/components/UserMenu.vue";
import UserPanel from "@/components/UserPanel.vue";
import TrainerMenu from "@/components/TrainerMenu.vue";
import SettingsMenu from "@/components/SettingsMenu.vue";
import SupportMenu from "@/components/SupportMenu.vue";
import SubscriptionMenu from "@/components/SubscriptionMenu.vue";
import CoachClients from "@/components/CoachClients.vue"; // Добавлен компонент клиентов

export default {
    components: {
        Header,
        UserMenu,
        UserPanel,
        TrainerMenu,
        SettingsMenu,
        SupportMenu,
        SubscriptionMenu,
        CoachClients
    },
    data() {
        return {
            user: null,
            selectedComponent: null
        };
    },
    mounted() {
        this.loadUserData();
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
                    this.setDefaultComponent();
                }
            }
        },
        setDefaultComponent() {
            if (this.user.role === "client") {
                this.selectedComponent = UserMenu;
            } else if (this.user.role === "coach") {
                this.selectedComponent = CoachClients;
            }
        },
        changeLeftComponent(menuItem) {
            const componentMap = {
                progress: UserMenu,
                trainer: TrainerMenu,
                settings: SettingsMenu,
                support: SupportMenu,
                subscription: SubscriptionMenu,
                clients: CoachClients
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
    justify-content: space-between;
    padding: 20px;
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