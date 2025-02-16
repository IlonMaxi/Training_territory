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
                { id: "Cardio_activities", label: "Замеры в см" },
                { id: "Strength_training", label: "Клиенты" },
                { id: "Flexibility_exercises", label: "Оплата" },
                { id: "Diet_records", label: "Питание" },
                { id: "Sleep_tracking", label: "Прогресс" },
                { id: "Water_intake", label: "Расписание" },
                { id: "Calorie_intake", label: "Рецепты" },
                { id: "Body_measurements", label: "Тренеры" },
                { id: "Medical_conditions", label: "Тренировки" },
                { id: "Training_programs", label: "Упражнения" },
                { id: "Personal_goals", label: "Расписание клиентов" }
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
    background: #161616;
    padding: 15px;
    border-radius: 8px;
    width: 250px;
}

.admin-info {
    display: flex;
    align-items: center;
    font-size: 16px;
    color: white;
    margin-bottom: 10px;
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
    color: white;
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
    border: 2px solid #ff6a00;
    background: #ffffff;
    color: black;
}
</style>