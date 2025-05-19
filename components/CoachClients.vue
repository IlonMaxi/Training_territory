<template>
    <div class="clients-list">
        <h2>Ваши клиенты</h2>

        <div v-if="loading">Загрузка...</div>
        <div v-else-if="clients.length === 0">У вас пока нет клиентов.</div>
        <ul v-else class="client-cards">
            <li v-for="client in clients" :key="client.clientid" class="client-card">
                <div class="client-name">{{ client.first_name }} {{ client.last_name }}</div>
                <div class="client-info">
                    <p><strong>Email:</strong> {{ client.email }}</p>
                    <p><strong>Телефон:</strong> {{ client.phone_number }}</p>
                    <p><strong>Пол:</strong> {{ client.gender }}</p>
                    <p><strong>Дата рождения:</strong> {{ formatDate(client.birth_date) }}</p>
                </div>
                <button class="view-progress-btn" @click="fetchProgress(client.clientid)">Посмотреть прогресс</button>

                <div v-if="clientProgress[client.clientid]" class="progress-details">
                    <h4>Прогресс:</h4>
                    <ul>
                        <li v-for="(value, key) in clientProgress[client.clientid]" :key="key">
                            {{ formatLabel(key) }}: {{ value }}%
                        </li>
                    </ul>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    data() {
        return {
            clients: [],
            loading: true,
            clientProgress: {}
        };
    },
    methods: {
        formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString("ru-RU");
        },
        formatLabel(key) {
            const map = {
                weight: 'Вес',
                fat_mass: 'Жировая масса',
                muscle_mass: 'Мышечная масса',
                water_content: 'Содержание воды',
                bmi: 'BMI',
                metabolism: 'Метаболизм',
                body_age: 'Возраст тела',
                fat_percentage: 'Процент жира',
                muscle_dynamics: 'Динамика мышц'
                // добавь остальные поля при необходимости
            };
            return map[key] || key;
        },
        async fetchProgress(clientId) {
            try {
                const res = await fetch(`http://26.100.29.243:3000/api/clients/${clientId}/progress-summary`);
                const data = await res.json();
                this.$set(this.clientProgress, clientId, data);
            } catch (err) {
                console.error(`Ошибка при загрузке прогресса клиента ${clientId}:`, err);
            }
        }
    },
    mounted() {
        const cookies = document.cookie.split('; ').reduce((acc, c) => {
            const [key, val] = c.split('=');
            acc[key] = decodeURIComponent(val);
            return acc;
        }, {});
        const user = JSON.parse(cookies.user || '{}');
        if (!user.coachid) return;

        fetch(`http://26.100.29.243:3000/api/coaches/${user.coachid}/clients`)
            .then(res => res.json())
            .then(data => {
                this.clients = data;
                this.loading = false;
            })
            .catch(err => {
                console.error('Ошибка при загрузке клиентов:', err);
                this.loading = false;
            });
    }
};
</script>

<style scoped>
.clients-list {
    margin: auto;
}

.client-cards {
    list-style: none;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: flex-start;
}

.client-cards {
    list-style: none;
    padding: 0;
}

.client-card {
    border: 1px solid var(--button-border-color);
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 10px;
    background-color: var(--background-color-white);
    color: var(--text-color);
    transition: background-color 0.5s, color 0.5s, border-color 0.5s;
}

.client-name {
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 8px;
}

.client-info {
    font-size: 14px;
    color: var(--text-color);
}

.view-progress-btn {
    margin-top: 10px;
    padding: 8px 12px;
    border: 2px solid var(--button-border-color);
    background-color: var(--button-hover-color);
    color: var(--button-hover-color-white);
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s, color 0.3s;
}

.view-progress-btn:hover {
    background-color: transparent;
    color: var(--button-hover-color);
}

.progress-details {
    margin-top: 10px;
    font-size: 14px;
    background-color: var(--background-color-white);
    padding: 10px;
    border-radius: 8px;
    border: 1px solid var(--button-border-color);
    color: var(--text-color);
}
</style>
