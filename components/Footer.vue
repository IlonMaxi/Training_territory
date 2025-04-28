<template>
    <footer class="footer">
        <div class="footer-content">
            <h2 class="footer-title">TRAINING TERRITORY</h2>
            <ul class="footer-links">
                <li><a href="#" @click.prevent="activateTrainFlip" :class="{ active: isTrainFlipActive }"><i class="fa-solid fa-dumbbell"></i><span> Тренеру</span></a></li>
                <li><a href="#" @click.prevent="activateClientFlip" :class="{ active: !isTrainFlipActive }"><i class="fa-solid fa-user-check"></i><span> Клиенту</span></a></li>
                <li><a href="#" @click.prevent="openLoginModal"><i class="fa-solid fa-user"></i><span> Вход</span></a></li>
                <li><a href="#" @click.prevent="openRegisterModal"><i class="fa-solid fa-user-plus"></i><span> Регистрация</span></a></li>
            </ul>

            <div class="divider-line"></div>
            <div class="footer-bottom">
                <p>© 2024 TRAINING TERRITORY, All Rights Reserved.</p>
                <div class="social-icons">
                    <a href="#" target="_blank" rel="noopener noreferrer">
                        <i class="fa-brands fa-facebook-f"></i>
                    </a>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                        <i class="fa-brands fa-instagram"></i>
                    </a>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                        <i class="fa-brands fa-x-twitter"></i>
                    </a>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                        <i class="fa-brands fa-linkedin-in"></i>
                    </a>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                        <i class="fa-brands fa-youtube"></i>
                    </a>
                </div>
            </div>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'FooterComponent',
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
.footer {
    background-color: var(--background-color-white);
    color: var(--text-color);
    text-align: center;
    padding: 40px 0;
    margin-top: 50px;
    transition: background-color 0.5s, color 0.5s;
}

.footer-title {
    margin-bottom: 20px;
}

.footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
}

.footer-links li {
    display: inline;
    margin: 0 10px;
}

.footer-links a {
    color: var(--text-color);
    text-decoration: none;
    transition: color 0.3s;
}

.footer-links a:hover {
    color: var(--button-hover-color);
}

.footer-links a.active {
    font-weight: bold;
    color: var(--button-hover-color);
}

.divider-line {
    height: 1px;
    background-color: var(--button-border-color);
    width: 80%;
    margin: 20px auto;
    transition: background-color 0.5s;
}

.footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    width: 80%;
    margin: 0 auto;
}

.social-icons a {
    color: var(--text-color);
    text-decoration: none;
    margin-left: 10px;
    transition: color 0.3s;
}

.social-icons a:hover {
    color: var(--button-hover-color);
}

.social-icons a i {
    font-size: 18px;
}

/* Для выделения активного элемента */
.active {
    font-weight: bold;
    color: var(--button-hover-color);
}

@media screen and (max-width: 820px) {
    .footer-links a span {
        display: none;
    }
}
</style>
