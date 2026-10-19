<template>
    <div class="tt-page">
        <div class="tt-backdrop" aria-hidden="true"></div>
        <CabinetHeader />

        <main class="tt-main admin-main">
            <div v-if="loading" class="tt-container checking">
                <span class="tt-dots"><span></span><span></span><span></span></span>
                Проверка доступа…
            </div>

            <div v-else-if="isAdmin" class="tt-container admin">
                <header class="tt-page-head admin-head">
                    <span class="tt-eyebrow"><i class="fa-solid fa-shield-halved"></i> Администрирование</span>
                    <h1 class="tt-page-title">Панель администратора</h1>
                    <p class="tt-page-lead">
                        Добро пожаловать, <b>{{ user.firstName }} {{ user.lastName }}</b>. Выберите таблицу —
                        записи можно добавлять, изменять и удалять.
                    </p>
                </header>

                <div class="admin-layout">
                    <aside class="admin-side">
                        <AdminPanel :groups="groups" :active="selectedTable" @select="changeTable" />
                    </aside>

                    <section class="admin-content" aria-label="Записи таблицы">
                        <CrudManager :key="selectedTable" :title="table.label" :icon="table.icon"
                            :endpoint="table.endpoint" :fields="table.fields" :primary-key="table.primaryKey" />
                    </section>
                </div>
            </div>
        </main>

        <CabinetFooter />
    </div>
</template>

<script>
import CabinetHeader from '@/components/common/Header.vue';
import CabinetFooter from '@/components/common/FooterLast.vue';
import AdminPanel from '@/components/admin/AdminPanel.vue';
import CrudManager from '@/components/admin/CrudManager.vue';
import { readUser, safePush } from '@/components/utils/cabinet.js';

// Таблицы админки: подпись и иконка для меню, адрес API и поля формы.
// optional — колонка в базе допускает пустое значение, поле можно не заполнять
const TABLES = {
    Clients: {
        label: 'Клиенты', icon: 'fa-solid fa-user', group: 'Люди',
        endpoint: 'admin/clients',
        primaryKey: 'clientid',
        fields: [
            { name: 'last_name', label: 'Фамилия' },
            { name: 'first_name', label: 'Имя' },
            { name: 'patronymic', label: 'Отчество', optional: true },
            { name: 'username', label: 'Логин' },
            { name: 'password', label: 'Пароль' },
            { name: 'phone_number', label: 'Телефон' },
            { name: 'email', label: 'Email' },
            { name: 'birth_date', label: 'Дата рождения', type: 'date' },
            { name: 'gender', label: 'Пол' }
        ]
    },

    Coaches: {
        label: 'Тренеры', icon: 'fa-solid fa-user-tie', group: 'Люди',
        endpoint: 'admin/coaches',
        primaryKey: 'coachid',
        fields: [
            { name: 'last_name', label: 'Фамилия' },
            { name: 'first_name', label: 'Имя' },
            { name: 'patronymic', label: 'Отчество', optional: true },
            { name: 'birth_date', label: 'Дата рождения', type: 'date' },
            { name: 'email', label: 'Email' },
            { name: 'phone_number', label: 'Телефон' },
            { name: 'specialization', label: 'Специализация', optional: true },
            { name: 'experience', label: 'Опыт работы', optional: true },
            { name: 'username', label: 'Логин' },
            { name: 'password', label: 'Пароль' },
            { name: 'gender', label: 'Пол', optional: true }
        ]
    },

    Schedule: {
        label: 'Расписание', icon: 'fa-solid fa-calendar-days', group: 'Расписание',
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
        label: 'Расписание клиентов', icon: 'fa-solid fa-calendar-check', group: 'Расписание',
        endpoint: 'admin/client-schedule',
        primaryKey: 'clientscheduleid',
        fields: [
            { name: 'client_id', label: 'Клиент', type: 'select', source: 'clients' },
            { name: 'schedule_id', label: 'Занятие', type: 'select', source: 'schedule' },
            { name: 'status', label: 'Статус' }
        ]
    },

    Workouts: {
        label: 'Тренировки', icon: 'fa-solid fa-dumbbell', group: 'Тренировки',
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

    // Состав программ: какие упражнения входят в тренировку и в каком
    // объёме. Отсюда помощник в чате берёт программы для клиента.
    Workout_exercises: {
        label: 'Состав тренировок', icon: 'fa-solid fa-list-check', group: 'Тренировки',
        endpoint: 'admin/workout-exercises',
        primaryKey: 'workoutexerciseid',
        fields: [
            { name: 'workout_id', label: 'Тренировка', type: 'select', source: 'workouts' },
            { name: 'exercise_id', label: 'Упражнение', type: 'select', source: 'exercises' },
            { name: 'position', label: 'Порядок', type: 'number' },
            { name: 'sets', label: 'Подходы', type: 'number' },
            { name: 'reps', label: 'Повторы' }
        ]
    },

    Exercises: {
        label: 'Упражнения', icon: 'fa-solid fa-person-running', group: 'Тренировки',
        endpoint: 'admin/exercises',
        primaryKey: 'exerciseid',
        fields: [
            { name: 'name', label: 'Название' },
            { name: 'name_en', label: 'Оригинал (англ.)' },
            { name: 'muscle_group', label: 'Группа мышц' },
            { name: 'description', label: 'Описание' },
            { name: 'difficulty_level', label: 'Уровень сложности' },
            { name: 'machine', label: 'Тренажёр' }
        ]
    },

    Nutrition: {
        label: 'Питание', icon: 'fa-solid fa-utensils', group: 'Питание',
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
            { name: 'meal_type', label: 'Тип приёма пищи' }
        ]
    },

    Recipes: {
        label: 'Рецепты', icon: 'fa-solid fa-book-open', group: 'Питание',
        endpoint: 'admin/recipes',
        primaryKey: 'recipeid',
        fields: [
            { name: 'name', label: 'Название' },
            { name: 'ingredients', label: 'Ингредиенты' },
            { name: 'preparation_time', label: 'Время приготовления', type: 'text' },
            { name: 'instructions', label: 'Инструкция' }
        ]
    },

    Measurements_in_kilograms: {
        label: 'Замеры в кг', icon: 'fa-solid fa-weight-scale', group: 'Замеры и прогресс',
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
        label: 'Замеры в см', icon: 'fa-solid fa-ruler', group: 'Замеры и прогресс',
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

    Measurements_in_percentage: {
        label: 'Замеры в %', icon: 'fa-solid fa-percent', group: 'Замеры и прогресс',
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
        label: 'Замеры в ед.', icon: 'fa-solid fa-gauge', group: 'Замеры и прогресс',
        endpoint: 'admin/unit-measurements',
        primaryKey: 'measurementid',
        fields: [
            { name: 'bmi', label: 'ИМТ', type: 'number', step: 0.01 },
            { name: 'metabolism', label: 'Метаболизм', type: 'number', step: 0.01 },
            { name: 'body_age', label: 'Возраст тела', type: 'number', step: 0.01 },
            { name: 'date', label: 'Дата', type: 'date' }
        ]
    },

    Weights_on_machine: {
        label: 'Вес на тренажёре', icon: 'fa-solid fa-dumbbell', group: 'Замеры и прогресс',
        endpoint: 'admin/weights-on-machines',
        primaryKey: 'weightid',
        fields: [
            { name: 'machine_weight', label: 'Вес (кг)', type: 'number', step: 0.01 },
            { name: 'date', label: 'Дата', type: 'date' }
        ]
    },

    Progress: {
        label: 'Прогресс', icon: 'fa-solid fa-chart-line', group: 'Замеры и прогресс',
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
    },

    Payments: {
        label: 'Оплата', icon: 'fa-solid fa-credit-card', group: 'Финансы',
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
        ]
    }
};

const DEFAULT_TABLE = 'Clients';

export default {
    components: { CabinetHeader, CabinetFooter, AdminPanel, CrudManager },
    data() {
        return {
            user: { id: null, firstName: '', lastName: '', login: '' },
            loading: true
        };
    },
    computed: {
        isAdmin() {
            return this.user.id === 1;
        },
        // Какая таблица открыта — хранит адрес (?table=Clients), так она переживает перезагрузку
        selectedTable() {
            const fromQuery = this.$route.query.table;
            return TABLES[fromQuery] ? fromQuery : DEFAULT_TABLE;
        },
        table() {
            return TABLES[this.selectedTable];
        },
        // Меню: таблицы по группам в порядке объявления
        groups() {
            const groups = [];
            Object.entries(TABLES).forEach(([id, table]) => {
                let group = groups.find(item => item.title === table.group);
                if (!group) {
                    group = { title: table.group, items: [] };
                    groups.push(group);
                }
                group.items.push({ id, label: table.label, icon: table.icon });
            });
            return groups;
        }
    },
    // Доступ проверяем по cookie после монтирования; сам API админки всё равно
    // закрыт на сервере (requireAdmin)
    mounted() {
        const userData = readUser();
        if (!userData) {
            this.$router.push('/');
            return;
        }
        this.user = {
            id: userData.clientid,
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            login: userData.username || ''
        };
        if (!this.isAdmin) {
            this.$router.push('/');
            return;
        }
        this.loading = false;
    },
    methods: {
        changeTable(table) {
            if (table === this.selectedTable) return;
            safePush(this.$router, { path: '/AdminPage', query: { table } });
        }
    }
};
</script>

<style scoped>
.admin-main {
    padding-top: 36px;
}

.checking {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 80px 0;
    color: var(--tt-muted);
    font-size: 15px;
}

.admin-head {
    margin-bottom: 28px;
}

.admin-head b {
    color: var(--tt-ink);
}

.admin-layout {
    display: grid;
    grid-template-columns: 270px minmax(0, 1fr);
    align-items: start;
    gap: 28px;
}

.admin-side {
    position: sticky;
    top: 104px;
}

.admin-content {
    min-width: 0;
}

@media (max-width: 1000px) {
    .admin-layout {
        grid-template-columns: minmax(0, 1fr);
        gap: 20px;
    }

    .admin-side {
        position: static;
    }
}

</style>
