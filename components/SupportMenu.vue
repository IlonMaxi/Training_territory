<template>
    <div class="support-container">
        <!-- Часто задаваемые вопросы -->
        <div class="faq">
            <h2>ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ</h2>
            <div v-for="(item, index) in faqItems" :key="index" class="faq-item">
                <div class="faq-question" @click="toggleAnswer(index)">
                    <span>{{ item.question }}</span>
                    <button class="faq-toggle">
                        <i :class="item.open ? 'fa-solid fa-minus' : 'fa-solid fa-plus'"></i>
                    </button>
                </div>
                <div v-if="item.open" class="faq-answer">
                    <p v-for="(answer, i) in item.answers" :key="i">{{ answer }}</p>
                </div>
            </div>
        </div>

        <!-- Блоки контактов -->
        <div class="support-info">
            <div class="support-box">
                <h3>Остались вопросы?</h3>
                <p>Напишите нам на почту</p>
                <p class="email">primer.ru</p>
            </div>

            <div class="support-box">
                <h3>Связаться с фитнес центром?</h3>
                <p>Телефон горячей линии</p>
                <p class="phone">+7-800-800-80-80</p>
            </div>

            <div class="support-box">
                <h3>График работы</h3>
                <p>Понедельник: с 09:00 до 18:00</p>
                <p>Вторник: с 09:00 до 18:00</p>
                <p>Среда: с 09:00 до 18:00</p>
                <p>Четверг: с 09:00 до 18:00</p>
                <p>Пятница: с 09:00 до 18:00</p>
                <p>Суббота: с 10:00 до 16:00</p>
                <p>Воскресенье: выходной</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            faqItems: [
                { question: "Вопрос 1", answers: ["Ответ на вопрос", "Ответ на вопрос", "Ответ на вопрос", "Ответ на вопрос"], open: false },
                { question: "Вопрос 2", answers: ["Ответ на вопрос", "Ответ на вопрос", "Ответ на вопрос", "Ответ на вопрос"], open: false },
                { question: "Вопрос 3", answers: ["Ответ на вопрос", "Ответ на вопрос", "Ответ на вопрос", "Ответ на вопрос"], open: false },
                { question: "Вопрос 4", answers: ["Ответ на вопрос", "Ответ на вопрос", "Ответ на вопрос", "Ответ на вопрос"], open: false },
            ]
        };
    },
    methods: {
        toggleAnswer(index) {
            this.faqItems[index].open = !this.faqItems[index].open;
        }
    }
};
</script>

<style scoped>
/* Контейнер */
.support-container {
    display: flex;
    gap: 20px;
    background: var(--background-color);
    padding: 20px;
    border-radius: 10px;
    transition: background-color 0.5s, color 0.5s;
}

/* Часто задаваемые вопросы */
.faq {
    background: linear-gradient(135deg, var(--button-hover-color), #e44d26);
    border-radius: 15px;
    padding: 20px;
    color: var(--button-hover-color-white);
    width: 40vw;
    transition: background-color 0.5s, color 0.5s;
}

.faq h2 {
    text-align: center;
    margin-bottom: 15px;
    color: var(--button-hover-color-white);
}

.faq-item {
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
    padding: 10px 0;
}

.faq-question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
}

.faq-toggle {
    background: none;
    border: none;
    color: var(--button-hover-color-white);
    font-size: 18px;
    cursor: pointer;
}

.faq-answer {
    padding-left: 10px;
    margin-top: 5px;
}

/* Контактные блоки */
.support-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.support-box {
    background: var(--background-color-white);
    padding: 15px;
    border-radius: 10px;
    color: var(--text-color);
    transition: background-color 0.5s, color 0.5s;
}

.email, .phone {
    font-weight: bold;
}
</style>