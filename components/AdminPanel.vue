<template>
    <div class="admin-panel">
        <button v-for="(item, index) in menuItems" :key="index"
            :class="['menu-btn', { active: selected === item.id }]"
            @click="selectMenu(item.id)">
            <i class="fa-solid fa-database"></i>
            {{ item.label }}
        </button>
    </div>
</template>

<script>
export default {
    props: {
        admin: {
            type: Object,
            default: () => ({ fullName: "ИМЯ ФАМИЛИЯ" })
        }
    },
    data() {
        return {
            selected: "Weights_on_machine",
            menuItems: [
                { id: "Weights_on_machine", label: "Вес на тренажёре" },
                { id: "Measurements_in_percentage", label: "Замеры в %" },
                { id: "Measurements_in_units", label: "Замеры в ед" },
                { id: "Measurements_in_kilograms", label: "Замеры в кг" },
                { id: "Measurements_in_centimeters", label: "Замеры в см" },
                { id: "Clients", label: "Клиенты" },
                { id: "Payments", label: "Оплата" },
                { id: "Nutrition", label: "Питание" },
                { id: "Progress", label: "Прогресс" },
                { id: "Schedule", label: "Расписание" },
                { id: "Recipes", label: "Рецепты" },
                { id: "Coaches", label: "Тренеры" },
                { id: "Workouts", label: "Тренировки" },
                { id: "Exercises", label: "Упражнения" },
                { id: "Client_schedule", label: "Расписание клиентов" }
            ]
        };
    },
    methods: {
        selectMenu(id) {
            this.selected = id;
            this.$emit("menu-selected", id);
        }
    }
};
</script>

<style scoped>
.admin-panel {
    display: flex;
    flex-direction: column;
    background: var(--background-color);
    padding: 15px;
    border-radius: 8px;
    width: 250px;
    transition: background-color 0.5s ease, color 0.5s ease;
}

.admin-info {
    display: flex;
    align-items: center;
    font-size: 16px;
    color: var(--text-color);
    margin-bottom: 10px;
    transition: color 0.5s ease;
}

.icon-admin {
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
    transition: all 0.3s ease;
    font-size: 14px;
    border-radius: 10px;
    font-weight: bold;
}

.menu-btn i {
    margin-right: 10px;
    font-size: large;
    transition: color 0.3s ease;
}

.menu-btn.active {
    border: 2px solid var(--button-hover-color);
    color: var(--text-color);
}
</style>
