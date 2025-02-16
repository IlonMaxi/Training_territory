<template>
    <div v-if="loading" class="loading">
        <p>Проверка доступа...</p>
    </div>

    <div v-else-if="user.id === 1" class="admin-container">
        <h1>Панель администратора</h1>
        <p>Добро пожаловать, <strong>{{ user.firstName }} {{ user.lastName }}</strong></p>
        <button @click="logout">Выйти</button>
        <div class="admin-page">
        <div class="admin-container">
            <!-- Левый компонент (меняется динамически) -->
            <component :is="selectedComponent" @menu-selected="changeLeftComponent" />

            <!-- Правая панель с меню выбора -->
            <AdminPanel @menu-selected="changeLeftComponent" />
        </div>
    </div>
    </div>

    <div v-else>
        <p>Нет доступа!</p>
    </div>

    
</template>

<script>
import AdminPanel from '../components/AdminPanel.vue';

export default {
    components: {
        AdminPanel
    },
    data() {
        return {
            user: {
                id: null,
                firstName: "",
                lastName: "",
                login: "",
            },
            loading: true, // Показываем "Проверка доступа..." перед редиректом
        };
    },
    mounted() {
        this.loadUserFromCookies();
        if (this.user.id !== 1) {
            this.$router.push("/"); // Если не админ, отправляем на главную
        } else {
            this.loading = false; // Если админ, убираем загрузку
        }
    },
    methods: {
        loadUserFromCookies() {
            const userCookie = document.cookie.split("; ").find(row => row.startsWith("user="));

            if (!userCookie) {
                this.$router.push("/");
                return;
            }

            try {
                const userData = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));

                this.user = {
                    id: userData.clientid,
                    firstName: userData.first_name || "",
                    lastName: userData.last_name || "",
                    login: userData.username || "",
                };
            } catch (error) {
                this.$router.push("/");
            }
        },

        logout() {
            document.cookie = "user=; path=/; max-age=0;";
            document.cookie = "accountType=; path=/; max-age=0;";
            this.$router.push("/");
        },
    }
};
</script>

<style>
body {
    background-color: #272827;
}
</style>

<style scoped>
.loading {
    text-align: center;
    font-size: 18px;
    margin-top: 50px;
}

.admin-container {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
    padding: 20px;
}

button {
    margin-top: 20px;
    padding: 10px 20px;
    font-size: 16px;
    background-color: #d9534f;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
}

button:hover {
    background-color: #c9302c;
}
</style>
