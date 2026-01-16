<template>
    <div v-if="loading" class="loading">
        <p>РџСЂРѕРІРµСЂРєР° РґРѕСЃС‚СѓРїР°...</p>
    </div>

    <div v-else-if="user.id === 1" class="admin-container">
        <div class="admin-text">
            <h1>РџР°РЅРµР»СЊ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°</h1>
            <p>Р”РѕР±СЂРѕ РїРѕР¶Р°Р»РѕРІР°С‚СЊ, <strong>{{ user.firstName }} {{ user.lastName }}</strong></p>
        </div>
        <button class="logout-btn" @click="logout">Р’С‹Р№С‚Рё</button>

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
import AdminPanel from '../components/admin/AdminPanel.vue';
import CrudManager from '../components/admin/CrudManager.vue';

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
                        { name: 'machine_weight', label: 'Р’РµСЃ (РєРі)', type: 'number', step: 0.01 },
                        { name: 'date', label: 'Р”Р°С‚Р°', type: 'date' },
                    ],
                },

                Clients: {
                    component: CrudManager,
                    endpoint: 'admin/clients',
                    primaryKey: 'clientid',
                    fields: [
                        { name: 'last_name', label: 'Р¤Р°РјРёР»РёСЏ' },
                        { name: 'first_name', label: 'РРјСЏ' },
                        { name: 'patronymic', label: 'РћС‚С‡РµСЃС‚РІРѕ' },
                        { name: 'username', label: 'Р›РѕРіРёРЅ' },
                        { name: 'password', label: 'РџР°СЂРѕР»СЊ' },
                        { name: 'phone_number', label: 'РўРµР»РµС„РѕРЅ' },
                        { name: 'email', label: 'Email' },
                        { name: 'birth_date', label: 'Р”Р°С‚Р° СЂРѕР¶РґРµРЅРёСЏ', type: 'date' },
                        { name: 'gender', label: 'РџРѕР»'},
                    ],
                },

                Payments: {
                    component: CrudManager,
                    endpoint: 'admin/payments',
                    primaryKey: 'paymentid',
                    fields: [
                        { name: 'payment_date', label: 'Р”Р°С‚Р° РѕРїР»Р°С‚С‹', type: 'date' },
                        { name: 'tariff', label: 'РўР°СЂРёС„' },
                        { name: 'tariff_type', label: 'РўРёРї С‚Р°СЂРёС„Р°' },
                        { name: 'training_sessions', label: 'Р’СЃРµРіРѕ С‚СЂРµРЅРёСЂРѕРІРѕРє', type: 'number' },
                        { name: 'used_training_sessions', label: 'РСЃРїРѕР»СЊР·РѕРІР°РЅРѕ', type: 'number' },
                        { name: 'start_date', label: 'Р”Р°С‚Р° РЅР°С‡Р°Р»Р°', type: 'date' },
                        { name: 'end_date', label: 'Р”Р°С‚Р° РѕРєРѕРЅС‡Р°РЅРёСЏ', type: 'date' },
                        { name: 'amount', label: 'РЎСѓРјРјР°', type: 'number', step: 0.01 },
                        { name: 'client_id', label: 'РљР»РёРµРЅС‚', type: 'select', source: 'clients' }
                    ],
                },

                Coaches: {
                    component: CrudManager,
                    endpoint: 'admin/coaches',
                    primaryKey: 'coachid',
                    fields: [
                        { name: 'last_name', label: 'Р¤Р°РјРёР»РёСЏ' },
                        { name: 'first_name', label: 'РРјСЏ' },
                        { name: 'patronymic', label: 'РћС‚С‡РµСЃС‚РІРѕ' },
                        { name: 'birth_date', label: 'Р”Р°С‚Р° СЂРѕР¶РґРµРЅРёСЏ', type: 'date' },
                        { name: 'email', label: 'Email' },
                        { name: 'phone_number', label: 'РўРµР»РµС„РѕРЅ' },
                        { name: 'specialization', label: 'РЎРїРµС†РёР°Р»РёР·Р°С†РёСЏ' },
                        { name: 'experience', label: 'РћРїС‹С‚ СЂР°Р±РѕС‚С‹' },
                        { name: 'username', label: 'Р›РѕРіРёРЅ' },
                        { name: 'password', label: 'РџР°СЂРѕР»СЊ' },
                        { name: 'gender', label: 'РџРѕР»'},
                    ],
                },

                Schedule: {
                    component: CrudManager,
                    endpoint: 'admin/schedule',
                    primaryKey: 'scheduleid',
                    fields: [
                        { name: 'date', label: 'Р”Р°С‚Р°', type: 'date' },
                        { name: 'start_time', label: 'РќР°С‡Р°Р»Рѕ', type: 'time' },
                        { name: 'end_time', label: 'РљРѕРЅРµС†', type: 'time' },
                        { name: 'location', label: 'Р›РѕРєР°С†РёСЏ' },
                        { name: 'workout_id', label: 'РўСЂРµРЅРёСЂРѕРІРєР°', type: 'select', source: 'workouts' },
                        { name: 'coach_id', label: 'РўСЂРµРЅРµСЂ', type: 'select', source: 'coaches' }
                    ]
                },

                Client_schedule: {
                    component: CrudManager,
                    endpoint: 'admin/client-schedule',
                    primaryKey: 'clientscheduleid',
                    fields: [
                        { name: 'client_id', label: 'РљР»РёРµРЅС‚', type: 'select', source: 'clients' },
                        { name: 'schedule_id', label: 'Р—Р°РЅСЏС‚РёРµ', type: 'select', source: 'schedule' },
                        { name: 'status', label: 'РЎС‚Р°С‚СѓСЃ' }
                    ]
                },

                Nutrition: {
                    component: CrudManager,
                    endpoint: 'admin/nutrition',
                    primaryKey: 'foodid',
                    fields: [
                        { name: 'name', label: 'РќР°Р·РІР°РЅРёРµ' },
                        { name: 'description', label: 'РћРїРёСЃР°РЅРёРµ' },
                        { name: 'protein_amount', label: 'Р‘РµР»РєРё', type: 'number', step: 0.01 },
                        { name: 'fat_amount', label: 'Р–РёСЂС‹', type: 'number', step: 0.01 },
                        { name: 'carbohydrate_amount', label: 'РЈРіР»РµРІРѕРґС‹', type: 'number', step: 0.01 },
                        { name: 'calories', label: 'РљР°Р»РѕСЂРёРё', type: 'number' },
                        { name: 'water_amount', label: 'Р’РѕРґР° (Р»)', type: 'number', step: 0.01 },
                        { name: 'date', label: 'Р”Р°С‚Р°', type: 'date' },
                        { name: 'coach_id', label: 'РўСЂРµРЅРµСЂ', type: 'select', source: 'coaches' },
                        { name: 'client_id', label: 'РљР»РёРµРЅС‚', type: 'select', source: 'clients' },
                        { name: 'recipe_id', label: 'Р РµС†РµРїС‚', type: 'select', source: 'recipes' },
                        { name: 'meal_type', label: 'РўРёРї РїСЂРёС‘РјР° РїРёС‰Рё' },
                    ],
                },

                Recipes: {
                    component: CrudManager,
                    endpoint: 'admin/recipes',
                    primaryKey: 'recipeid',
                    fields: [
                        { name: 'name', label: 'РќР°Р·РІР°РЅРёРµ' },
                        { name: 'ingredients', label: 'РРЅРіСЂРµРґРёРµРЅС‚С‹' },
                        { name: 'preparation_time', label: 'Р’СЂРµРјСЏ РїСЂРёРіРѕС‚РѕРІР»РµРЅРёСЏ', type: 'text' },
                        { name: 'instructions', label: 'РРЅСЃС‚СЂСѓРєС†РёСЏ' },
                    ],
                },

                Workouts: {
                    component: CrudManager,
                    endpoint: 'admin/workouts',
                    primaryKey: 'workoutid',
                    fields: [
                        { name: 'name', label: 'РќР°Р·РІР°РЅРёРµ' },
                        { name: 'description', label: 'РћРїРёСЃР°РЅРёРµ' },
                        { name: 'difficulty', label: 'РЎР»РѕР¶РЅРѕСЃС‚СЊ' },
                        { name: 'duration', label: 'Р”Р»РёС‚РµР»СЊРЅРѕСЃС‚СЊ', type: 'text' },
                        { name: 'workout_type', label: 'РўРёРї' },
                        { name: 'max_participants', label: 'РњР°РєСЃ. СѓС‡Р°СЃС‚РЅРёРєРѕРІ', type: 'number' },
                        { name: 'coach_id', label: 'РўСЂРµРЅРµСЂ', type: 'select', source: 'coaches' },
                        { name: 'exercise_id', label: 'РЈРїСЂР°Р¶РЅРµРЅРёРµ', type: 'select', source: 'exercises' }
                    ]
                },

                Exercises: {
                    component: CrudManager,
                    endpoint: 'admin/exercises',
                    primaryKey: 'exerciseid',
                    fields: [
                        { name: 'name', label: 'РќР°Р·РІР°РЅРёРµ' },
                        { name: 'description', label: 'РћРїРёСЃР°РЅРёРµ' },
                        { name: 'difficulty_level', label: 'РЈСЂРѕРІРµРЅСЊ СЃР»РѕР¶РЅРѕСЃС‚Рё' },
                        { name: 'machine', label: 'РўСЂРµРЅР°Р¶С‘СЂ' }
                    ]
                },

                Measurements_in_percentage: {
                    component: CrudManager,
                    endpoint: 'admin/percentage-measurements',
                    primaryKey: 'percentageid',
                    fields: [
                        { name: 'fat_percentage', label: 'РџСЂРѕС†РµРЅС‚ Р¶РёСЂР° (%)', type: 'number', step: 0.01 },
                        { name: 'skeletal_mass_percentage', label: 'РЎРєРµР»РµС‚РЅР°СЏ РјР°СЃСЃР° (%)', type: 'number', step: 0.01 },
                        { name: 'muscle_dynamics', label: 'РњС‹С€РµС‡РЅР°СЏ РґРёРЅР°РјРёРєР° (%)', type: 'number', step: 0.01 },
                        { name: 'body_water', label: 'Р’РѕРґР° РІ С‚РµР»Рµ (%)', type: 'number', step: 0.01 },
                        { name: 'protein', label: 'Р‘РµР»РѕРє (%)', type: 'number', step: 0.01 },
                        { name: 'fat_content', label: 'Р–РёСЂРѕРІР°СЏ РјР°СЃСЃР° (%)', type: 'number', step: 0.01 },
                        { name: 'date', label: 'Р”Р°С‚Р°', type: 'date' }
                    ]
                },

                Measurements_in_units: {
                    component: CrudManager,
                    endpoint: 'admin/unit-measurements',
                    primaryKey: 'measurementid',
                    fields: [
                        { name: 'bmi', label: 'РРњРў', type: 'number', step: 0.01 },
                        { name: 'metabolism', label: 'РњРµС‚Р°Р±РѕР»РёР·Рј', type: 'number', step: 0.01 },
                        { name: 'body_age', label: 'Р’РѕР·СЂР°СЃС‚ С‚РµР»Р°', type: 'number', step: 0.01 },
                        { name: 'date', label: 'Р”Р°С‚Р°', type: 'date' }
                    ]
                },

                Measurements_in_kilograms: {
                    component: CrudManager,
                    endpoint: 'admin/kg-measurements',
                    primaryKey: 'kilogramid',
                    fields: [
                        { name: 'weight', label: 'Р’РµСЃ (РєРі)', type: 'number', step: 0.01 },
                        { name: 'fat_mass', label: 'Р–РёСЂРѕРІР°СЏ РјР°СЃСЃР° (РєРі)', type: 'number', step: 0.01 },
                        { name: 'skeletal_mass', label: 'РЎРєРµР»РµС‚РЅР°СЏ РјР°СЃСЃР° (РєРі)', type: 'number', step: 0.01 },
                        { name: 'muscle_mass', label: 'РњС‹С€РµС‡РЅР°СЏ РјР°СЃСЃР° (РєРі)', type: 'number', step: 0.01 },
                        { name: 'water_content', label: 'РЎРѕРґРµСЂР¶Р°РЅРёРµ РІРѕРґС‹ (РєРі)', type: 'number', step: 0.01 },
                        { name: 'bone_mass', label: 'РљРѕСЃС‚РЅР°СЏ РјР°СЃСЃР° (РєРі)', type: 'number', step: 0.01 },
                        { name: 'lbm', label: 'РњР°СЃСЃР° Р±РµР· Р¶РёСЂР° (LBM)', type: 'number', step: 0.01 },
                        { name: 'date', label: 'Р”Р°С‚Р°', type: 'date' }
                    ]
                },

                Measurements_in_centimeters: {
                    component: CrudManager,
                    endpoint: 'admin/cm-measurements',
                    primaryKey: 'centimetreid',
                    fields: [
                        { name: 'chest_circumference', label: 'РћР±С…РІР°С‚ РіСЂСѓРґРё (СЃРј)', type: 'number', step: 0.01 },
                        { name: 'waist_circumference', label: 'РћР±С…РІР°С‚ С‚Р°Р»РёРё (СЃРј)', type: 'number', step: 0.01 },
                        { name: 'hip_circumference', label: 'РћР±С…РІР°С‚ Р±С‘РґРµСЂ (СЃРј)', type: 'number', step: 0.01 },
                        { name: 'bicep_circumference', label: 'РћР±С…РІР°С‚ Р±РёС†РµРїСЃР° (СЃРј)', type: 'number', step: 0.01 },
                        { name: 'forearm_circumference', label: 'РћР±С…РІР°С‚ РїСЂРµРґРїР»РµС‡СЊСЏ (СЃРј)', type: 'number', step: 0.01 },
                        { name: 'quadriceps_circumference', label: 'РћР±С…РІР°С‚ РєРІР°РґСЂРёС†РµРїСЃР° (СЃРј)', type: 'number', step: 0.01 },
                        { name: 'calf_circumference', label: 'РћР±С…РІР°С‚ РёРєСЂС‹ (СЃРј)', type: 'number', step: 0.01 },
                        { name: 'thigh_circumference', label: 'РћР±С…РІР°С‚ Р±РµРґСЂР° (СЃРј)', type: 'number', step: 0.01 },
                        { name: 'neck_circumference', label: 'РћР±С…РІР°С‚ С€РµРё (СЃРј)', type: 'number', step: 0.01 },
                        { name: 'waist_inhale_circumference', label: 'РћР±С…РІР°С‚ С‚Р°Р»РёРё РїСЂРё РІРґРѕС…Рµ (СЃРј)', type: 'number', step: 0.01 },
                        { name: 'date', label: 'Р”Р°С‚Р°', type: 'date' }
                    ]
                },

                Progress: {
                    component: CrudManager,
                    endpoint: 'admin/progress',
                    primaryKey: 'progressid',
                    fields: [
                        { name: 'measurement_analysis', label: 'РђРЅР°Р»РёР· РёР·РјРµСЂРµРЅРёР№' },
                        { name: 'weight_analysis', label: 'РђРЅР°Р»РёР· РІРµСЃР°' },
                        { name: 'full_measurement_analysis', label: 'РџРѕР»РЅС‹Р№ Р°РЅР°Р»РёР· Р·Р°РјРµСЂРѕРІ' },
                        { name: 'full_weight_analysis', label: 'РџРѕР»РЅС‹Р№ Р°РЅР°Р»РёР· РІРµСЃР°' },
                        { name: 'client_id', label: 'РљР»РёРµРЅС‚', type: 'select', source: 'clients' },
                        { name: 'unit_measurement_id', label: 'Р•Рґ. Р·Р°РјРµСЂС‹', type: 'select', source: 'measurements_in_units' },
                        { name: 'percentage_measurement_id', label: 'РџСЂРѕС†РµРЅС‚С‹', type: 'select', source: 'measurements_in_percentage' },
                        { name: 'kilogram_measurement_id', label: 'РљРі Р·Р°РјРµСЂС‹', type: 'select', source: 'measurements_in_kilograms' },
                        { name: 'centimetre_measurement_id', label: 'РЎРј Р·Р°РјРµСЂС‹', type: 'select', source: 'measurements_in_centimeters' },
                        { name: 'weight_id', label: 'Р’РµСЃ РЅР° С‚СЂРµРЅР°Р¶С‘СЂРµ', type: 'select', source: 'weights_on_machine' }
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

