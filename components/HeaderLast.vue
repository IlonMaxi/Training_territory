<template>
    <header>
        <nav>
            <div class="logo">
                <h1>TRENING TERRITORY</h1>
            </div>
            <div class="navbar">
                <ul>
                    <li><a href="#" @click.prevent="activateTrainFlip" :class="{ active: isTrainFlipActive }">
                            <i class="fa-solid fa-dumbbell"></i>
                            <p>Тренеру</p>
                        </a></li>
                    <li><a href="#" @click.prevent="activateClientFlip" :class="{ active: !isTrainFlipActive }">
                            <i class="fa-solid fa-user-check"></i>
                            <p>Клиенту</p>
                        </a></li>
                    <li><a href="#" @click.prevent="openLoginModal">
                            <i class="fa-solid fa-user"></i>
                            <p>Вход</p>
                        </a></li>
                    <li><a href="#" @click.prevent="openRegisterModal">
                            <i class="fa-solid fa-user-plus"></i>
                            <p>Регистрация</p>
                        </a></li>
                </ul>
            </div>
        </nav>
    </header>
</template>

<script>
export default {
    name: 'HeaderLast',
    props: ['isTrainFlipActive'],
    methods: {
        openLoginModal() {
            this.$emit('open-login-modal');
        },
        openRegisterModal() {
            this.$emit('open-register-modal');
        },
        activateTrainFlip() {
            this.$emit('activate-train-flip');
        },
        activateClientFlip() {
            this.$emit('activate-client-flip');
        }
    }
}
</script>

<style scoped>
header {
    background-size: cover;
    background-position: center;
    display: flex;
    flex-direction: column;
    align-items: center;
}

nav {
    width: 80%;
    background-color: #272827;
    padding: 20px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px;
}

.logo h1 {
    margin: 0;
    color: white;
    font-size: 24px;
}

.navbar ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
}

.navbar ul li {
    margin-left: 5vw;
    font-size: 18px;
}

.navbar ul li:first-child {
    margin-left: 0;
}

.navbar ul li a {
    text-decoration: none;
    color: white;
    display: flex;
    align-items: center;
    position: relative;
    transition: color 0.3s ease; /* Добавляем плавный переход для цвета текста */
}

.navbar p {
    padding-left: 10px;
}

.navbar ul li a::after {
    content: '';
    position: absolute;
    bottom: 0px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background-color: white;
    transition: width 0.3s ease;
}

.navbar ul li a:hover::after {
    width: 100%;
}

.navbar ul li a.active {
    font-weight: bold;
    color: #DD7548;
}

.navbar ul li a.active::after {
    background-color: #DD7548;
}

@media screen and (max-width: 940px) {
    .logo h1 {
        margin: 0;
        color: white;
        font-size: 20px;
    }
}

@media screen and (max-width: 820px) {
    nav {
        width: 90%;
        padding: 15px;
    }

    .logo h1 {
        font-size: 20px;
    }

    .navbar ul {
        align-items: center;
    }

    .navbar ul li {
        margin-left: 20px;
        font-size: 16px;
    }

    .navbar ul li:first-child {
        margin-left: 0;
    }

    .navbar ul li a {
        justify-content: center;
    }

    .navbar p {
        display: none;
    }

    .navbar ul li a::after {
        bottom: -8px;
    }
}

</style>
