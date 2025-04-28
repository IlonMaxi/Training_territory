<template>
    <header>
        <nav>
            <div class="logo">
                <h1>TRAINING TERRITORY</h1>
            </div>
            <div class="navbar">
                <ul>
                    <li><a href="#" @click.prevent="activateTrainFlip" :class="{ active: isTrainFlipActive }">
                            <i class="fa-solid fa-dumbbell"></i>
                            <p>Тренеру</p>
                        </a>
                    </li>
                    <li><a href="#" @click.prevent="activateClientFlip" :class="{ active: !isTrainFlipActive }">
                            <i class="fa-solid fa-user-check"></i>
                            <p>Клиенту</p>
                        </a>
                    </li>
                    <li><a href="#" @click.prevent="openLoginModal">
                            <i class="fa-solid fa-user"></i>
                            <p>Вход</p>
                        </a>
                    </li>
                    <li><a href="#" @click.prevent="openRegisterModal">
                            <i class="fa-solid fa-user-plus"></i>
                            <p>Регистрация</p>
                        </a>
                    </li>
                    <li>
                        <a href="#" @click.prevent="toggleTheme">
                            <i :class="themeIcon"></i>
                            <p>Тема</p>
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    </header>
</template>

<script>
export default {
    name: 'HeaderLast',
    props: ['isTrainFlipActive'],
    data() {
        return {
            isDark: false
        }
    },
    mounted() {
        const savedTheme = this.getCookie('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            this.isDark = true;
        } else {
            document.body.classList.remove('dark-theme');
            this.isDark = false;
        }
    },
    computed: {
        themeIcon() {
            return this.isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
    },
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
        },
        toggleTheme() {
            this.isDark = !this.isDark;
            if (this.isDark) {
                document.body.classList.add('dark-theme');
                this.setCookie('theme', 'dark', 365);
            } else {
                document.body.classList.remove('dark-theme');
                this.setCookie('theme', 'light', 365);
            }
        },
        setCookie(name, value, days) {
            const d = new Date();
            d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = "expires=" + d.toUTCString();
            document.cookie = `${name}=${value};${expires};path=/`;
        },
        getCookie(name) {
            const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
                const [key, value] = cookie.split('=');
                acc[key] = decodeURIComponent(value);
                return acc;
            }, {});
            return cookies[name] || null;
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
    background-color: var(--background-color-white);
    padding: 20px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px;
}

.logo h1 {
    margin: 0;
    color: var(--text-color);
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
    color: var(--text-color);
    display: flex;
    align-items: center;
    position: relative;
    transition: color 0.3s ease;
}

.navbar ul li a::after {
    content: '';
    position: absolute;
    bottom: 0px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background-color: var(--text-color);
    transition: width 0.3s ease;
}

.navbar ul li a:hover::after {
    width: 100%;
}

.navbar ul li a.active {
    font-weight: bold;
    color: var(--button-hover-color);
}

.navbar ul li a.active::after {
    background-color: var(--button-hover-color);
}

@media screen and (max-width: 940px) {
    .logo h1 {
        margin: 0;
        color: var(--text-color);
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

/* Плавный переход между темами */
header,
nav,
.navbar ul li a,
.logo h1 {
    transition: background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease;
}
</style>