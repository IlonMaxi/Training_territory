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
.footer-links a.active {
    font-weight: bold;
    color: #DD7548;
}

.footer {
    background-color: #747474;
    color: white;
    text-align: center;
    padding: 40px 0;
    margin-top: 50px;
}

.footer-title {
    margin-bottom: 20px;
}

.footer-links {
    list-style: none;
    padding: 0;
}

.footer-links li {
    display: inline;
    margin: 0 10px;
}

.footer-links a {
    color: white;
    text-decoration: none;
}

.divider-line {
    height: 1px;
    background-color: #DD7548;
    width: 80%;
    margin: 20px auto;
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
    color: white;
    text-decoration: none;
    margin-left: 10px;
}

.social-icons a i {
    font-size: 18px;
}

.active {
    font-weight: bold;
}

@media screen and (max-width: 820px) {
    .footer-links a span {
        display: none;
    }
}
</style>
