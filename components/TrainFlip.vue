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
                <!-- Добавьте вашу структуру карт с расписанием здесь -->
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
    color: white;
    padding: 0 15px;
}

a {
    text-decoration: none;
    color: white;
}

a:hover {
    color: #DD7548;
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
    background-color: #434343;
    box-shadow: 0px 5px 0px #DD7548;
    border: none;
    color: white;
    padding: 15px 30px;
    margin: 10px;
    font-size: 18px;
    transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease-out;
}

.coach-btn:hover {
    transform: translateY(-5px);
}

.coach-btn:hover a {
    color: #DD7548;
}

.schedule-btn {
    background-color: transparent;
    border: none;
    color: white;
    padding: 15px 30px;
    margin: 10px;
    font-size: 18px;
    transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease-out;
}

.schedule-btn:hover {
    background-color: #434343;
    transform: translateY(-5px);
}

.schedule-btn:hover a {
    color: #DD7548;
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

/* .background-rectangle {
    position: absolute;
    background-color: #454645;
    height: 250px;
    width: 90%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    border-radius: 10px;
    z-index: -1;
    margin-top: 25vh;
} */

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
    color: white;
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
    color: #ffffff;
    font-size: 32px;
}

.line {
    display: inline-block;
    width: 30px;
    height: 2px;
    background-color: #DD7548;
    margin-left: 10px;
    vertical-align: middle;
}

.advantage-block {
    width: 48%;
}

.fa-solid,
.fas {
    font-weight: 900;
}

.fa-classic,
.fa-regular,
.fa-solid,
.far,
.fas {
    font-family: "Font Awesome 6 Free";
}

.fa,
.fa-brands,
.fa-classic,
.fa-regular,
.fa-sharp,
.fa-solid,
.fab,
.far,
.fas {
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    display: var(--fa-display, inline-block);
    font-style: normal;
    font-variant: normal;
    line-height: 1;
    text-rendering: auto;
}

.icon i.fa-solid.fa-sitemap,
.fa-file-invoice-dollar,
.fa-calendar-check,
.fa-clipboard-list {
    font-size: 70px;
    color: #DD7548;
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
    color: white;
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
    justify-content: center;
    align-items: center;
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
    background-color: #f1f1f1;
}

.text-on-back {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 470px;
    padding: 20px;
    text-align: center;
}

.text-block {
    width: 80%;
    margin: 20px auto;
    text-align: center;
    color: white;
}

.useful-info {
    display: flex;
    align-items: center;
    margin-top: 50px;
}

.info-text p {
    font-size: 18px;
    line-height: 1.6;
    color: white;
    margin-left: 40px;
}

/* Медиазапросы для адаптации */
@media screen and (max-width: 1200px) {
    .trainer-container {
        flex-direction: column;
        align-items: center;
    }

    .trainer-info {
        display: flex;
        flex-direction: column;
        width: 100%;
        justify-content: center;
        align-items: center;
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

    .schedule-images .image-container {
        margin-bottom: 20px;
    }

    .trainer-container img {
        margin-right: 0;
    }
}

@media screen and (max-width: 768px) {

    .background-rectangle {
        display: none;
    }

    .trainer-info p {
        font-size: 14px;
    }

    .text-block {
        width: 100%;
    }

    .info-text p {
        font-size: 16px;
        margin-left: 20px;
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

    .advantage-content {
        flex-direction: column;
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

    .info-text p {
        font-size: 14px;
        margin-left: 10px;
    }

    .icon {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .icon i {
        width: 40px;
        height: 40px;
        font-size: 40px !important;
    }

}

@media screen and (max-width: 455px) {
    .btn-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
}
</style>