<template>
    <div class="feedback-container">
        <div class="feedback-form">
            <h2>ОСТАВИТЬ ОТЗЫВ</h2>
            <p>Поделитесь впечатлениями о тренировках или работе тренера</p>

            <label for="rating">Оценка:</label>
            <select v-model="form.rating" id="rating">
                <option disabled value="">Выберите оценку</option>
                <option v-for="n in 5" :key="n" :value="n">{{ n }} ⭐ {{ getStarsLabel(n) }}</option>
            </select>

            <label for="comment">Комментарий:</label>
            <textarea id="comment" v-model="form.comment" placeholder="Напишите ваш отзыв..." rows="5"></textarea>

            <button class="submit-btn" @click="submitFeedback">Отправить отзыв</button>

            <p v-if="success" class="success-message">Спасибо за ваш отзыв!</p>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        user: Object // передаётся из родителя (user.email, user.first_name и т.д.)
    },
    data() {
        return {
            form: {
                rating: '',
                comment: ''
            },
            success: false
        };
    },
    methods: {
        getStarsLabel(n) {
            if (n === 1) return 'звезда';
            if (n >= 2 && n <= 4) return 'звезды';
            return 'звёзд';
        },
        async submitFeedback() {
            if (!this.form.rating || !this.form.comment.trim()) {
                alert("Пожалуйста, заполните все поля.");
                return;
            }

            try {
                const res = await fetch("api/send-feedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        rating: this.form.rating,
                        comment: this.form.comment,
                        clientEmail: this.user?.email || "не указан",
                        clientName: `${this.user?.first_name || ''} ${this.user?.last_name || ''}`.trim()
                    })
                });

                const result = await res.json();

                if (result.success) {
                    this.success = true;
                    this.form.rating = '';
                    this.form.comment = '';
                    setTimeout(() => (this.success = false), 3000);
                } else {
                    alert("Не удалось отправить отзыв.");
                }
            } catch (err) {
                alert("Ошибка при соединении с сервером.");
                console.error(err);
            }
        }

    }
};
</script>
<style scoped>
.feedback-container {
    display: flex;
    justify-content: center;
    padding: 20px;
    margin: auto;
}

.feedback-form {
    background: var(--background-color-white);
    padding: 25px;
    border-radius: 15px;
    max-width: 500px;
    width: 100%;
    color: var(--text-color);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.feedback-form h2 {
    text-align: center;
    margin-bottom: 10px;
}

.feedback-form label {
    display: block;
    margin: 15px 0 5px;
}

.feedback-form select,
.feedback-form textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--button-border-color);
    border-radius: 5px;
    resize: none;
    font-size: 14px;
    background: var(--background-color);
    color: var(--text-color);
}

.submit-btn {
    margin-top: 20px;
    width: 100%;
    padding: 10px;
    background-color: var(--button-hover-color);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
}

.submit-btn:hover {
    background-color: #c43b20;
}

.success-message {
    margin-top: 15px;
    text-align: center;
    color: green;
    font-weight: bold;
}
</style>
