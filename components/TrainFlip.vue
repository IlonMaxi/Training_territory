<template>
    <main>
        <p>Здесь вы найдете все необходимое для успешной работы тренера в спорте</p>

        <div class="btn-container">
            <button class="coach-btn">
                <a href="#trainer-section">ТРЕНЕРСТВО</a>
            </button>
            <button class="schedule-btn">
                <a href="#schedule-section">РАСПИСАНИЕ</a>
            </button>
        </div>

        <!-- Секция "Тренерство" с FlipWords -->
        <div id="trainer-section" class="trainer-container">
            <div class="background-rectangle"></div>
            <img src="https://thumbs.dreamstime.com/b/close-up-man-feet-treadmill-male-legs-running-blurred-motion-71101484.jpg"
                alt="Running on Treadmill" />
            <div class="trainer-info">
                <h2>
                    <FlipWords :words="['ЭФФЕКТИВНО', 'ЛЕГКО', 'УДОБНО']" />
                </h2>
                <p>
                    У нас вы всегда будете в курсе актуальных новостей и событий в нашей
                    индустрии. Мы предлагаем вам возможность вступить в наше уникальное
                    комьюнити, где вы найдете не только возможности для взаимодействия,
                    но и погружение в мир эффективности и профессионального роста...
                </p>
            </div>
        </div>

        <!-- Преимущества -->
        <div class="advantage-container">
            <h2 class="advantage-heading">
                В чем преимущество?<span class="line"></span>
            </h2>
            <div class="advantage-content">
                <div class="advantage-block">
                    <div class="icon">
                        <i class="fa-solid fa-clipboard-list"></i>
                    </div>
                    <p>
                        Строй своё рабочее расписание, определяй время работы с клиентами,
                        перерывов, тренировками и другими задачами...
                    </p>
                </div>
                <div class="advantage-block">
                    <div class="icon">
                        <i class="fa-solid fa-calendar-check"></i>
                    </div>
                    <p>
                        Записывай и отслеживай свои задачи, а также отмечай их выполнение...
                    </p>
                </div>
            </div>
        </div>

        <!-- Секция с расписанием -->
        <div id="schedule-section" class="schedule-section">
            <h2>Расписание</h2>
            <p>Насколько оно важно для клиента?</p>

            <div class="schedule-images">
                <div class="background-rectangle"></div>

                <div class="image-container">
                    <div class="flip-card">
                        <div class="flip-card-inner">
                            <div class="flip-card-front">
                                <img src="https://i.pinimg.com/originals/bb/13/ac/bb13ac3dd63fd93fe3b16b8d0fb635c9.jpg"
                                    alt="Изображение 1" width="300" height="500" class="flip-image">
                            </div>
                            <div class="flip-card-back">
                                <div class="text-on-back">
                                    <p> 7:00 – Пробуждение <br> <br>
                                        8:00-8:30 – Завтрак (каша с фруктами)<br> <br>
                                        10:00-12:00 – Тренировка в фитнес-центре<br> <br>
                                        12:30-13:00 – Полдник (орехи и ягоды)<br> <br>
                                        13:00-14:00 – Обед (курица гриль с овощами)<br><br>
                                        19:00-20:00 – Ужин (рыба с овощами и гречкой)<br><br>
                                        22:00 – Ложиться спать</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="image-container">
                    <div class="flip-card">
                        <div class="flip-card-inner">
                            <div class="flip-card-front">
                                <img src="https://i.pinimg.com/originals/5e/95/37/5e953797561655e176b16ba054548400.png"
                                    alt="Изображение 1" width="300" height="500" class="flip-image">
                            </div>
                            <div class="flip-card-back">
                                <div class="text-on-back">
                                    <p>Завтрак:<br>
                                        1. Белковый смузи<br>
                                        2. Омлет с овощами<br>
                                        3. Тост с авокадо и лососем<br>
                                        <br>
                                        Обед:<br>
                                        1. Куриные грудки с картофельным пюре<br>
                                        2. Греческий йогурт с орехами и медом<br>
                                        <br>
                                        Ужин:<br>
                                        1. Тунец на гриле с овощами<br>
                                        2. Зеленый салат с крабовыми палочками<br>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="image-container">
                    <div class="flip-card">
                        <div class="flip-card-inner">
                            <div class="flip-card-front">
                                <img src="https://sun9-44.userapi.com/impg/rvI4M_XCHB9H3TlKQ6RA6r2c6-fLUY5YiZwviQ/KcstCwpM87Y.jpg?size=453x604&quality=95&sign=f6db54fc6c5152f645891bd5d556517f&c_uniq_tag=rhl55Pcp69zwtPywQYPY5m4qFPzqRWoGxgAp868jfic&type=album"
                                    alt="Изображение 1" width="300" height="500" class="flip-image">
                            </div>
                            <div class="flip-card-back">
                                <div class="text-on-back">
                                    <p>Жим штанги - базовое упражнение для грудных, плеч и трицепса<br>
                                        <br>
                                        Становая тяга - базовое упражнение для спины и ног<br>
                                        <br>
                                        Присяд со штангой - базовое упражнение для низа тела<br>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- Блок текста -->
        <div class="text-block">
            <p>
                Определите свои приоритеты, учтите свою энергетику, включите перерывы...
            </p>
        </div>

        <!-- Полезная информация -->
        <div class="useful-info">
            <div class="icon">
                <i class="fa-solid fa-sitemap"></i>
            </div>
            <div class="info-text">
                <p>
                    Training territory представляет собой чёткую и интуитивно понятную
                    платформу...
                </p>
            </div>
        </div>

        <div class="useful-info">
            <div class="icon">
                <i class="fa-solid fa-file-invoice-dollar"></i>
            </div>
            <div class="info-text">
                <p>
                    Мы предоставляем тренерам возможность задавать свою цену за тренировку...
                </p>
            </div>
        </div>
    </main>
</template>

<script setup>
import FlipWords from "@/components/FlipWords.vue"; // Компонент с анимацией слов
</script>

<style scoped>
main {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--text-color);
    padding: 0 15px;
}

a {
    text-decoration: none;
    color: var(--text-color);
}

a:hover {
    color: var(--button-hover-color);
}

.btn-container {
    margin-bottom: 20px;
}

.btn-container button {
    padding: 15px 30px;
    margin: 10px;
    font-size: 18px;
}

.coach-btn {
    background-color: var(--button-border-color);
    box-shadow: 0px 5px 0px var(--button-hover-color);
    border: none;
    color: var(--text-color);
    padding: 15px 30px;
    margin: 10px;
    font-size: 18px;
    transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease-out;
}

.coach-btn:hover {
    transform: translateY(-5px);
    transition: transform 0.3s ease-in-out;
}

.coach-btn:hover a {
    color: var(--button-hover-color-white);
}

.schedule-btn {
    background-color: transparent;
    border: none;
    color: var(--text-color);
    padding: 15px 30px;
    margin: 10px;
    font-size: 18px;
    transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease-out;
}

.schedule-btn:hover {
    background-color: var(--button-border-color);
    transform: translateY(-5px);
    transition: transform 0.3s ease-in-out;
}

.schedule-btn:hover a {
    color: var(--button-hover-color-white);
}

.schedule-images img {
    border-radius: 20px;
    margin-right: 10px;
}

.trainer-container {
    display: flex;
    position: relative;
    width: 90%;
    max-width: 1000px;
    margin: 0 auto;
}

.trainer-container img {
    width: 300px;
    height: 400px;
    border-radius: 10px;
    margin-right: 50px;
}

.trainer-info {
    width: 60%;
}

.trainer-info p {
    color: var(--text-color);
    font-size: 16px;
    line-height: 1.6;
}

.advantage-container {
    text-align: center;
    margin-top: 10px;
    width: 90%;
    max-width: 1000px;
}

.advantage-heading {
    color: var(--text-color);
    font-size: 32px;
}

.line {
    display: inline-block;
    width: 30px;
    height: 2px;
    background-color: var(--button-hover-color);
    margin-left: 10px;
    vertical-align: middle;
}

.advantage-block {
    width: 48%;
}

.icon i.fa-solid.fa-sitemap,
.fa-file-invoice-dollar,
.fa-calendar-check,
.fa-clipboard-list {
    font-size: 70px;
    color: var(--button-hover-color);
    margin: 30px;
    transition: transform 0.3s ease-in-out;
}

.icon i:hover {
    animation: rotateIcon 0.6s ease-in-out forwards;
}

@keyframes rotateIcon {
    0% {
        transform: rotate(0);
    }

    33% {
        transform: rotate(-15deg);
    }

    66% {
        transform: rotate(12deg);
    }

    100% {
        transform: rotate(0);
    }
}

.advantage-content {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
    flex-wrap: wrap;
}

.schedule-section {
    text-align: center;
    margin-top: 10px;
    width: 90%;
    max-width: 1000px;
    color: var(--text-color);
}

.schedule-section h2 {
    font-size: 32px;
    margin-bottom: 10px;
}

.schedule-section p {
    font-size: 20px;
    margin-bottom: 30px;
}

.schedule-images {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.schedule-images .image-container {
    position: relative;
    width: 300px;
    height: 500px;
    margin-right: 10px;
}

.flip-card {
    perspective: 1000px;
}

.flip-card-inner {
    position: absolute;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.6s;
    transform-style: preserve-3d;
}

.flip-card:hover .flip-card-inner {
    transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
}

.flip-card-back {
    transform: rotateY(180deg);
    background-color: var(--background-color);
}

.text-on-back {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 470px;
    padding: 20px;
    text-align: center;
    color: var(--text-color);
}

.text-block {
    width: 80%;
    margin: 20px auto;
    text-align: center;
    color: var(--text-color);
}

.useful-info {
    display: flex;
    align-items: center;
    margin-top: 50px;
}

.info-text p {
    font-size: 18px;
    line-height: 1.6;
    color: var(--text-color);
    margin-left: 40px;
}

/* Плавные переходы */
main,
nav,
.coach-btn,
.schedule-btn,
.text-on-back,
.trainer-info p,
.advantage-heading,
.info-text p,
.schedule-section,
.text-block {
    transition: background-color 0.5s ease, color 0.5s ease;
}

/* Медиа-запросы */
@media screen and (max-width: 1200px) {
    .trainer-container {
        flex-direction: column;
        align-items: center;
    }

    .trainer-info {
        width: 100%;
        text-align: center;
    }

    .advantage-content {
        flex-direction: column;
        align-items: center;
    }

    .advantage-block {
        width: 100%;
        margin-bottom: 20px;
    }

    .schedule-images {
        flex-direction: column;
        align-items: center;
    }

    .trainer-container img {
        margin-right: 0;
    }
}

@media screen and (max-width: 768px) {

    .trainer-info p,
    .text-block p,
    .info-text p {
        font-size: 14px;
    }

    .icon i {
        font-size: 50px;
    }
}

@media screen and (max-width: 480px) {
    .trainer-container img {
        width: 100%;
        height: auto;
    }

    .advantage-block {
        width: 100%;
    }

    .schedule-images {
        flex-direction: column;
    }

    .text-block p {
        font-size: 14px;
    }

    .icon i {
        width: 40px;
        height: 40px;
        font-size: 40px !important;
    }
}

@media screen and (max-width: 455px) {
    .btn-container {
        flex-direction: column;
        align-items: center;
    }
}
</style>
