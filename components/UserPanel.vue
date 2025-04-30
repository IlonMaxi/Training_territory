<template>
    <div class="user-panel">
        <div class="user-info">
            <i class="icon-user"></i>
            <span>{{ user.first_name }} {{ user.last_name }}</span>
        </div>

        <button v-for="(item, index) in menuItems" :key="index" :class="['menu-btn', { active: selected === item.id }]"
            @click="selectMenu(item.id)">
            <i :class="item.icon"></i>
            {{ item.label }}
        </button>

        <button class="subscribe-btn" @click="$emit('menu-selected', 'subscription')">
            <i class="fa-brands fa-shopify"></i>
            ПОДПИСКА
        </button>

    </div>
</template>

<script>
export default {
    props: {
        user: {
            type: Object,
            default: () => ({ fullName: "ИМЯ ФАМИЛИЯ" })
        }
    },
    data() {
        return {
            selected: "progress",
            menuItems: [
                { id: "progress", label: "ВАШ ПРОГРЕСС", icon: "fa-solid fa-circle-user" },
                { id: "trainer", label: "ВАШ ТРЕНЕР", icon: "fa-solid fa-user-tie" },
                { id: "settings", label: "НАСТРОЙКИ", icon: "fa-solid fa-cogs" },
                { id: "support", label: "ПОДДЕРЖКА", icon: "fa-solid fa-headset" }
            ]
        };
    }
    ,
    methods: {
        selectMenu(id) {
            this.selected = id;
            this.$emit("menu-selected", id);
        }
    }
};
</script>

<style scoped>
.user-panel {
    display: flex;
    flex-direction: column;
    background: var(--background-color);
    padding: 15px;
    border-radius: 8px;
    width: 250px;
    transition: background-color 0.5s, color 0.5s;
}

.user-info {
    display: flex;
    align-items: center;
    font-size: 16px;
    color: var(--text-color);
    margin-bottom: 10px;
    transition: color 0.5s;
}

.icon-user {
    margin-right: 10px;
}

.menu-btn {
    display: flex;
    align-items: center;
    padding: 10px;
    background: transparent;
    border: 2px solid transparent;
    color: var(--text-color);
    text-align: left;
    cursor: pointer;
    transition: 0.3s;
    font-size: 14px;
    border-radius: 10px;
    font-weight: bold;
}

.menu-btn i {
    margin-right: 10px;
    font-size: large;
}

.menu-btn.active {
    border: 2px solid var(--button-hover-color);
    background: var(--background-color-white);
    color: var(--text-color);
    transition: background-color 0.5s, color 0.5s, border-color 0.5s;
}

.subscribe-btn {
    margin-top: 10px;
    border: 2px solid var(--button-hover-color);
    color: var(--button-hover-color);
    font-weight: bold;
    text-align: left;
    padding: 10px;
    display: flex;
    align-items: center;
    cursor: pointer;
    background: var(--background-color-white);
    border-radius: 10px;
    transition: background-color 0.5s, color 0.5s, border-color 0.5s;
}

.subscribe-btn i {
    margin-right: 10px;
    font-size: large;
}
</style>