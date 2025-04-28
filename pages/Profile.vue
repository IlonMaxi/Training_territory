<template>
    <div class="profile-page">
        <!-- Хедер -->
        <Header />

        <div class="profile-container">
            <!-- Левый компонент (меняется динамически) -->
            <component :is="selectedComponent" @menu-selected="changeLeftComponent" />

            <!-- Правая панель с меню выбора -->
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

export default {
    components: {
        Header,
        UserMenu,
        UserPanel,
        TrainerMenu,
        SettingsMenu,
        SupportMenu,
    },
    data() {
        return {
            user: null,
            selectedComponent: UserMenu, // По умолчанию отображается UserMenu
        };
    },
    mounted() {
        this.loadUserData();
    },
    methods: {
        loadUserData() {
            if (process.client) {
                const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
                    const [key, value] = cookie.split("=");
                    acc[key] = decodeURIComponent(value);
                    return acc;
                }, {});

                if (cookies.user) {
                    this.user = JSON.parse(cookies.user);
                }
            }
        },
        changeLeftComponent(menuItem) {
            console.log("Меняем левый компонент на:", menuItem);

            const componentMap = {
                progress: UserMenu, // Обычное меню
                trainer: TrainerMenu,
                settings: SettingsMenu,
                support: SupportMenu,
            };

            this.selectedComponent = componentMap[menuItem] || UserMenu;
        },
    },
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
</style>
