<template>
    <div class="trainer-container" v-if="coach">
        <div class="trainer-photo">
            <img :src="photoUrl" alt="Фото тренера" />
            <div class="border-accent"></div>
        </div>

        <div class="trainer-info">
            <p>
                Привет! Меня зовут <strong>{{ coach.first_name }} {{ coach.last_name }}</strong>, я ваш персональный
                тренер на платформе
                Trening Territory.
                <br />
                Специализируюсь на <strong>{{ coach.specialization || 'общих тренировках' }}</strong>.
                <br />
                Опыт работы — <strong>{{ coach.experience || 'не указан' }}</strong>.
            </p>

            <div class="contact-block">
                <p><strong>Связь:</strong> {{ coach.email }} / {{ coach.phone_number }}</p>
            </div>
        </div>
    </div>

    <div v-else class="trainer-container">
        <p>Информация о тренере не найдена.</p>
    </div>
</template>

<script>
export default {
    name: "TrainerMenu",
    data() {
        return {
            coach: null
        };
    },
    computed: {
        photoUrl() {
            // Путь к изображению по умолчанию
            return "/default-trainer.jpg";
        }
    },
    mounted() {
        const cookies = document.cookie.split("; ").reduce((acc, c) => {
            const [key, val] = c.split("=");
            acc[key] = decodeURIComponent(val);
            return acc;
        }, {});
        if (cookies.user) {
            const user = JSON.parse(cookies.user);
            fetch(`http://26.100.29.243:3000/api/clients/${user.clientid}/coach`)
                .then(res => res.json())
                .then(data => {
                    this.coach = data;
                })
                .catch(err => {
                    console.error("Ошибка при загрузке тренера:", err);
                });
        }
    }
};
</script>

<style scoped>
.trainer-container {
    display: flex;
    align-items: flex-start;
    gap: 40px;
    padding: 20px;
    color: var(--text-color);
    background-color: var(--background-color);
    border-radius: 10px;
}

.trainer-photo {
    position: relative;
    flex-shrink: 0;
}

.trainer-photo img {
    width: 300px;
    height: auto;
    border-radius: 20px;
    object-fit: cover;
}

.border-accent {
    position: absolute;
    bottom: -10px;
    right: -10px;
    width: 90%;
    height: 90%;
    border: 10px solid var(--button-hover-color);
    border-radius: 20px;
    z-index: -1;
}

.trainer-info {
    flex-grow: 1;
    font-size: 16px;
    line-height: 1.6;
    max-width: 600px;
}

.contact-block {
    background-color: var(--background-color-white);
    color: var(--text-color);
    padding: 20px;
    border-radius: 15px;
    margin-top: 20px;
    font-size: 15px;
}
</style>