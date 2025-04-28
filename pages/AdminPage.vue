<template>
    <div v-if="loading" class="loading">
        <p>Проверка доступа...</p>
    </div>

    <div v-else-if="user.id === 1" class="admin-container">
        <div class="admin-text">
            <h1>Панель администратора</h1>
            <p>Добро пожаловать, <strong>{{ user.firstName }} {{ user.lastName }}</strong></p>
        </div>
        <button class="logout-btn" @click="logout">Выйти</button>

        <div class="admin-page">
            <div class="crud-container">
                <component :is="selectedComponent.component" :key="selectedTable" :endpoint="selectedComponent.endpoint"
                    :fields="selectedComponent.fields" :primaryKey="selectedComponent.primaryKey" />
            </div>

            <div class="panel-container">
                <AdminPanel @menu-selected="changeLeftComponent" />
            </div>
        </div>
    </div>
</template>

<script>
import AdminPanel from '../components/AdminPanel.vue';
import CrudManager from '../components/CrudManager.vue';

export default {
    components: { AdminPanel, CrudManager },
    data() {
        return {
            user: { id: null, firstName: '', lastName: '', login: '' },
            loading: true,
            selectedTable: 'Weights_on_machine',
            selectedComponent: {},
        };
    },
    mounted() {
        this.loadUserFromCookies();
        if (this.user.id !== 1) this.$router.push('/');
        else {
            this.selectedComponent = this.getComponentByTable(this.selectedTable);
            this.loading = false;
        }
    },
    methods: {
        loadUserFromCookies() {
            const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='));
            if (!userCookie) return this.$router.push('/');

            try {
                const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
                this.user = {
                    id: userData.clientid,
                    firstName: userData.first_name || '',
                    lastName: userData.last_name || '',
                    login: userData.username || '',
                };
            } catch (e) {
                this.$router.push('/');
            }
        },
        logout() {
            document.cookie = 'user=; path=/; max-age=0';
            document.cookie = 'accountType=; path=/; max-age=0';
            this.$router.push('/');
        },
        changeLeftComponent(table) {
            this.selectedTable = table;
            this.selectedComponent = this.getComponentByTable(table);
        },
        getComponentByTable(table) {
            const config = {
                Weights_on_machine: {
                    component: CrudManager,
                    endpoint: 'admin/weights-on-machines',
                    primaryKey: 'weightid',
                    fields: [
                        { name: 'machine_weight', label: 'Вес (кг)', type: 'number', step: 0.01 },
                        { name: 'date', label: 'Дата', type: 'date' },
                    ],
                },

                Clients: {
                    component: CrudManager,
                    endpoint: 'admin/clients',
                    primaryKey: 'clientid',
                    fields: [
                        { name: 'last_name', label: 'Фамилия' },
                        { name: 'first_name', label: 'Имя' },
                        { name: 'patronymic', label: 'Отчество' },
                        { name: 'username', label: 'Логин' },
                        { name: 'password', label: 'Пароль' },
                        { name: 'phone_number', label: 'Телефон' },
                        { name: 'email', label: 'Email' },
                        { name: 'birth_date', label: 'Дата рождения', type: 'date' },
                        { name: 'gender', label: 'Пол'},
                    ],
                },

                Payments: {
                    component: CrudManager,
                    endpoint: 'admin/payments',
                    primaryKey: 'paymentid',
                    fields: [
                        { name: 'payment_date', label: 'Дата оплаты', type: 'date' },
                        { name: 'tariff', label: 'Тариф' },
                        { name: 'tariff_type', label: 'Тип тарифа' },
                        { name: 'training_sessions', label: 'Всего тренировок', type: 'number' },
                        { name: 'used_training_sessions', label: 'Использовано', type: 'number' },
                        { name: 'start_date', label: 'Дата начала', type: 'date' },
                        { name: 'end_date', label: 'Дата окончания', type: 'date' },
                        { name: 'amount', label: 'Сумма', type: 'number', step: 0.01 },
                        { name: 'client_id', label: 'Клиент', type: 'select', source: 'clients' }
                    ],
                },

                Coaches: {
                    component: CrudManager,
                    endpoint: 'admin/coaches',
                    primaryKey: 'coachid',
                    fields: [
                        { name: 'last_name', label: 'Фамилия' },
                        { name: 'first_name', label: 'Имя' },
                        { name: 'patronymic', label: 'Отчество' },
                        { name: 'birth_date', label: 'Дата рождения', type: 'date' },
                        { name: 'email', label: 'Email' },
                        { name: 'phone_number', label: 'Телефон' },
                        { name: 'specialization', label: 'Специализация' },
                        { name: 'experience', label: 'Опыт работы' },
                        { name: 'username', label: 'Логин' },
                        { name: 'password', label: 'Пароль' },
                        { name: 'gender', label: 'Пол'},
                    ],
                },

                Schedule: {
                    component: CrudManager,
                    endpoint: 'admin/schedule',
                    primaryKey: 'scheduleid',
                    fields: [
                        { name: 'date', label: 'Дата', type: 'date' },
                        { name: 'start_time', label: 'Начало', type: 'time' },
                        { name: 'end_time', label: 'Конец', type: 'time' },
                        { name: 'location', label: 'Локация' },
                        { name: 'workout_id', label: 'Тренировка', type: 'select', source: 'workouts' },
                        { name: 'coach_id', label: 'Тренер', type: 'select', source: 'coaches' }
                    ]
                },

                Client_schedule: {
                    component: CrudManager,
                    endpoint: 'admin/client-schedule',
                    primaryKey: 'clientscheduleid',
                    fields: [
                        { name: 'client_id', label: 'Клиент', type: 'select', source: 'clients' },
                        { name: 'schedule_id', label: 'Занятие', type: 'select', source: 'schedule' },
                        { name: 'status', label: 'Статус' }
                    ]
                },

                Nutrition: {
                    component: CrudManager,
                    endpoint: 'admin/nutrition',
                    primaryKey: 'foodid',
                    fields: [
                        { name: 'name', label: 'Название' },
                        { name: 'description', label: 'Описание' },
                        { name: 'protein_amount', label: 'Белки', type: 'number', step: 0.01 },
                        { name: 'fat_amount', label: 'Жиры', type: 'number', step: 0.01 },
                        { name: 'carbohydrate_amount', label: 'Углеводы', type: 'number', step: 0.01 },
                        { name: 'calories', label: 'Калории', type: 'number' },
                        { name: 'water_amount', label: 'Вода (л)', type: 'number', step: 0.01 },
                        { name: 'date', label: 'Дата', type: 'date' },
                        { name: 'coach_id', label: 'Тренер', type: 'select', source: 'coaches' },
                        { name: 'client_id', label: 'Клиент', type: 'select', source: 'clients' },
                        { name: 'recipe_id', label: 'Рецепт', type: 'select', source: 'recipes' },
                        { name: 'meal_type', label: 'Тип приёма пищи' },
                    ],
                },

                Recipes: {
                    component: CrudManager,
                    endpoint: 'admin/recipes',
                    primaryKey: 'recipeid',
                    fields: [
                        { name: 'name', label: 'Название' },
                        { name: 'ingredients', label: 'Ингредиенты' },
                        { name: 'preparation_time', label: 'Время приготовления', type: 'text' },
                        { name: 'instructions', label: 'Инструкция' },
                    ],
                },

                Workouts: {
                    component: CrudManager,
                    endpoint: 'admin/workouts',
                    primaryKey: 'workoutid',
                    fields: [
                        { name: 'name', label: 'Название' },
                        { name: 'description', label: 'Описание' },
                        { name: 'difficulty', label: 'Сложность' },
                        { name: 'duration', label: 'Длительность', type: 'text' },
                        { name: 'workout_type', label: 'Тип' },
                        { name: 'max_participants', label: 'Макс. участников', type: 'number' },
                        { name: 'coach_id', label: 'Тренер', type: 'select', source: 'coaches' },
                        { name: 'exercise_id', label: 'Упражнение', type: 'select', source: 'exercises' }
                    ]
                },

                Exercises: {
                    component: CrudManager,
                    endpoint: 'admin/exercises',
                    primaryKey: 'exerciseid',
                    fields: [
                        { name: 'name', label: 'Название' },
                        { name: 'description', label: 'Описание' },
                        { name: 'difficulty_level', label: 'Уровень сложности' },
                        { name: 'machine', label: 'Тренажёр' }
                    ]
                },

                Measurements_in_percentage: {
                    component: CrudManager,
                    endpoint: 'admin/percentage-measurements',
                    primaryKey: 'percentageid',
                    fields: [
                        { name: 'fat_percentage', label: 'Процент жира (%)', type: 'number', step: 0.01 },
                        { name: 'skeletal_mass_percentage', label: 'Скелетная масса (%)', type: 'number', step: 0.01 },
                        { name: 'muscle_dynamics', label: 'Мышечная динамика (%)', type: 'number', step: 0.01 },
                        { name: 'body_water', label: 'Вода в теле (%)', type: 'number', step: 0.01 },
                        { name: 'protein', label: 'Белок (%)', type: 'number', step: 0.01 },
                        { name: 'fat_content', label: 'Жировая масса (%)', type: 'number', step: 0.01 },
                        { name: 'date', label: 'Дата', type: 'date' }
                    ]
                },

                Measurements_in_units: {
                    component: CrudManager,
                    endpoint: 'admin/unit-measurements',
                    primaryKey: 'measurementid',
                    fields: [
                        { name: 'bmi', label: 'ИМТ', type: 'number', step: 0.01 },
                        { name: 'metabolism', label: 'Метаболизм', type: 'number', step: 0.01 },
                        { name: 'body_age', label: 'Возраст тела', type: 'number', step: 0.01 },
                        { name: 'date', label: 'Дата', type: 'date' }
                    ]
                },

                Measurements_in_kilograms: {
                    component: CrudManager,
                    endpoint: 'admin/kg-measurements',
                    primaryKey: 'kilogramid',
                    fields: [
                        { name: 'weight', label: 'Вес (кг)', type: 'number', step: 0.01 },
                        { name: 'fat_mass', label: 'Жировая масса (кг)', type: 'number', step: 0.01 },
                        { name: 'skeletal_mass', label: 'Скелетная масса (кг)', type: 'number', step: 0.01 },
                        { name: 'muscle_mass', label: 'Мышечная масса (кг)', type: 'number', step: 0.01 },
                        { name: 'water_content', label: 'Содержание воды (кг)', type: 'number', step: 0.01 },
                        { name: 'bone_mass', label: 'Костная масса (кг)', type: 'number', step: 0.01 },
                        { name: 'lbm', label: 'Масса без жира (LBM)', type: 'number', step: 0.01 },
                        { name: 'date', label: 'Дата', type: 'date' }
                    ]
                },

                Measurements_in_centimeters: {
                    component: CrudManager,
                    endpoint: 'admin/cm-measurements',
                    primaryKey: 'centimetreid',
                    fields: [
                        { name: 'chest_circumference', label: 'Обхват груди (см)', type: 'number', step: 0.01 },
                        { name: 'waist_circumference', label: 'Обхват талии (см)', type: 'number', step: 0.01 },
                        { name: 'hip_circumference', label: 'Обхват бёдер (см)', type: 'number', step: 0.01 },
                        { name: 'bicep_circumference', label: 'Обхват бицепса (см)', type: 'number', step: 0.01 },
                        { name: 'forearm_circumference', label: 'Обхват предплечья (см)', type: 'number', step: 0.01 },
                        { name: 'quadriceps_circumference', label: 'Обхват квадрицепса (см)', type: 'number', step: 0.01 },
                        { name: 'calf_circumference', label: 'Обхват икры (см)', type: 'number', step: 0.01 },
                        { name: 'thigh_circumference', label: 'Обхват бедра (см)', type: 'number', step: 0.01 },
                        { name: 'neck_circumference', label: 'Обхват шеи (см)', type: 'number', step: 0.01 },
                        { name: 'waist_inhale_circumference', label: 'Обхват талии при вдохе (см)', type: 'number', step: 0.01 },
                        { name: 'date', label: 'Дата', type: 'date' }
                    ]
                },

                Progress: {
                    component: CrudManager,
                    endpoint: 'admin/progress',
                    primaryKey: 'progressid',
                    fields: [
                        { name: 'measurement_analysis', label: 'Анализ измерений' },
                        { name: 'weight_analysis', label: 'Анализ веса' },
                        { name: 'full_measurement_analysis', label: 'Полный анализ замеров' },
                        { name: 'full_weight_analysis', label: 'Полный анализ веса' },
                        { name: 'client_id', label: 'Клиент', type: 'select', source: 'clients' },
                        { name: 'unit_measurement_id', label: 'Ед. замеры', type: 'select', source: 'measurements_in_units' },
                        { name: 'percentage_measurement_id', label: 'Проценты', type: 'select', source: 'measurements_in_percentage' },
                        { name: 'kilogram_measurement_id', label: 'Кг замеры', type: 'select', source: 'measurements_in_kilograms' },
                        { name: 'centimetre_measurement_id', label: 'См замеры', type: 'select', source: 'measurements_in_centimeters' },
                        { name: 'weight_id', label: 'Вес на тренажёре', type: 'select', source: 'weights_on_machine' }
                    ]
                }


            };

            return config[table] || config['Weights_on_machine'];
        },
    },
};
</script>

<style scoped>
body {
    background-color: var(--background-color);
    transition: background-color 0.5s ease, color 0.5s ease;
}

.loading {
    text-align: center;
    font-size: 18px;
    margin-top: 50px;
    color: var(--text-color);
}

.admin-container {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
    padding: 20px;
}

.admin-text {
    color: var(--text-color);
    transition: color 0.5s ease;
}

.admin-page {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

.crud-container {
    flex: 2;
    padding: 20px;
    background: var(--background-color-white);
    border-radius: 10px;
    transition: background-color 0.5s ease;
}

.panel-container {
    flex: 1;
    padding: 20px;
    background: var(--background-color-white);
    border-radius: 10px;
    transition: background-color 0.5s ease;
}

button.logout-btn {
    margin-top: 20px;
    padding: 10px 20px;
    background: var(--button-hover-color);
    color: var(--button-hover-color-white);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s, color 0.3s;
}

button.logout-btn:hover {
    background: var(--button-border-color);
}
</style>
