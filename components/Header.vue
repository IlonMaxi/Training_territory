<template>
    <header>
        <nav>
            <div class="logo">
                <h1>TRAINING TERRITORY</h1>
            </div>
            <div class="navbar">
                <ul class="desktop-menu">
                    <li><a href="#" class="nav-button" @click="navigateToSection('schedule')">РАСПИСАНИЕ</a></li>
                    <li><a href="#" class="nav-button" @click="navigateToSection('nutrition')">ПИТАНИЕ</a></li>
                    <li><a href="#" class="nav-button" @click="navigateToSection('progress')">ПРОГРЕСС</a></li>
                    <li v-if="isAdmin">
                        <router-link to="/AdminPage" class="nav-button">АДМИН-ПАНЕЛЬ</router-link>
                    </li>
                    <li>
                        <router-link to="/profile" class="profile-icon">
                            <i class="fa-solid fa-user"></i>
                        </router-link>
                    </li>
                    <li>
                        <button class="nav-button theme-button" @click.prevent="toggleTheme">
                            <i :class="themeIcon"></i> Тема
                        </button>
                    </li>
                    <li>
                        <button class="nav-button logout-button" @click="logout">
                            <i class="fa-solid fa-right-from-bracket"></i> Выход
                        </button>
                    </li>
                </ul>

                <div class="burger-icon" @click="toggleMobileMenu" role="button" aria-label="Открыть мобильное меню"
                    tabindex="0">
                    <i class="fa-solid fa-bars"></i>
                </div>
                <div class="mobile-menu-overlay" v-if="isMobileMenuOpen" @click="closeMobileMenu"></div>
                <ul class="mobile-menu" :class="{ 'active': isMobileMenuOpen }">
                    <li><a href="#" class="nav-button" @click="navigateToSection('schedule')">РАСПИСАНИЕ</a></li>
                    <li><a href="#" class="nav-button" @click="navigateToSection('nutrition')">ПИТАНИЕ</a></li>
                    <li><a href="#" class="nav-button" @click="navigateToSection('progress')">ПРОГРЕСС</a></li>
                    <li v-if="isAdmin">
                        <router-link to="/admin" class="nav-button" @click="closeMobileMenu">АДМИН-ПАНЕЛЬ</router-link>
                    </li>
                    <li><button class="nav-button theme-button" @click="toggleTheme">
                            <i :class="themeIcon"></i> Тема
                        </button></li>
                    <li><button class="nav-button logout-button" @click="logout">
                            <i class="fa-solid fa-right-from-bracket"></i> Выход
                        </button></li>
                    <li>
                        <router-link to="/profile" class="profile-icon" @click="closeMobileMenu">
                            <i class="fa-solid fa-user"></i> ПРОФИЛЬ
                        </router-link>
                    </li>
                </ul>
            </div>
        </nav>
    </header>
</template>

<script>
export default {
    name: 'HeaderLast',
    data() {
        return {
            isMobileMenuOpen: false,
            isAdmin: false,
            isDark: false,
        };
    },
    mounted() {
        const savedTheme = this.getCookie('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            this.isDark = true;
        } else {
            this.isDark = false;
        }
        this.checkIfAdmin();
    },
    computed: {
        themeIcon() {
            return this.isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
    },
    methods: {
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
        logout() {
            document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "accountType=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "theme=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            this.$router.push('/'); // Перенаправление на главную
        },
        toggleMobileMenu() {
            this.isMobileMenuOpen = !this.isMobileMenuOpen;
        },
        closeMobileMenu(event) {
            if (!event || !event.target.closest('.mobile-menu')) {
                this.isMobileMenuOpen = false;
            }
        },
        async navigateToSection(section) {
            const accountType = this.getCookie('accountType');

            let routeName = accountType === 'trainer' ? 'TrainerPage' :
                accountType === 'client' ? 'ClientPage' : null;

            if (routeName) {
                try {
                    if (this.$route.name !== routeName) {
                        await this.$router.push({ name: routeName, query: { section } });
                    }
                    this.scrollToSection(section);
                } catch (error) {
                    console.error('Ошибка при навигации:', error);
                }
            } else {
                console.warn('Неизвестный тип аккаунта.');
            }
        },
        scrollToSection(section) {
            this.$nextTick(() => {
                const element = document.getElementById(section);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            });
        },
        getCookie(name) {
            const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
                const [key, value] = cookie.split('=');
                acc[key] = decodeURIComponent(value);
                return acc;
            }, {});
            return cookies[name] || null;
        },
        setCookie(name, value, days) {
            const d = new Date();
            d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = "expires=" + d.toUTCString();
            document.cookie = `${name}=${value};${expires};path=/`;
        },
        checkIfAdmin() {
            const userCookie = this.getCookie('user');
            if (userCookie) {
                try {
                    const user = JSON.parse(userCookie);
                    this.isAdmin = user.clientid === 1;
                } catch (err) {
                    console.error('Ошибка парсинга user cookie:', err);
                }
            }
        }
    }
};
</script>

<style scoped>
/* Основные стили */
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
    padding: 10px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px;
    transition: background-color 0.5s ease;
}

.logo h1 {
    margin: 0;
    color: var(--text-color);
    font-size: 24px;
}

/* Меню для ПК */
.desktop-menu {
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
}

.desktop-menu li {
    margin-left: 20px;
    font-size: 18px;
}

.desktop-menu li:first-child {
    margin-left: 0;
}

/* Кнопки меню */
.nav-button {
    text-decoration: none;
    color: var(--text-color);
    background-color: transparent;
    padding: 10px 20px;
    border: 2px solid var(--button-border-color);
    border-radius: 20px;
    transition: all 0.3s ease;
    display: inline-block;
    text-align: center;
}

.nav-button:hover {
    background-color: var(--button-hover-color);
    color: var(--button-hover-color-white);
}

/* Иконка профиля */
.profile-icon {
    border: 2px solid var(--button-border-color);
    border-radius: 50%;
    padding: 5px;
    color: var(--text-color);
    display: inline-block;
    text-align: center;
    transition: background-color 0.3s ease, color 0.3s ease;
    width: 40px;
}

.profile-icon:hover {
    background-color: var(--button-hover-color);
    color: var(--button-hover-color-white);
}

/* Иконка бургера */
.burger-icon {
    display: none;
    color: var(--text-color);
    font-size: 24px;
    cursor: pointer;
}

/* Оверлей для затемнения экрана */
.mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9;
}

/* Мобильное меню */
.mobile-menu {
    position: fixed;
    top: 80px;
    right: -100%;
    width: 300px;
    background: var(--background-color-white);
    border-radius: 15px 0 0 15px;
    padding: 15px;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
    transition: right 0.3s ease-in-out, background-color 0.5s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    z-index: 1000;
}

.mobile-menu.active {
    right: 0;
}

.mobile-menu .nav-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    font-size: 16px;
    font-weight: bold;
    text-decoration: none;
    color: var(--text-color);
    border: 2px solid var(--button-border-color);
    border-radius: 8px;
    background: var(--background-color-white);
    transition: all 0.3s ease-in-out;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-menu li {
    width: 100%;
}

.mobile-menu li i {
    margin-right: 20px;
    color: var(--button-hover-color);
    font-size: 22px;
    border: 2px solid var(--button-border-color);
    border-radius: 50%;
    width: 51px;
    height: 51px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.5s ease, color 0.5s ease;
}

.mobile-menu a:hover {
    background: var(--button-hover-color);
    color: var(--button-hover-color-white);
}

/* Иконка профиля в мобильном меню */
.mobile-menu .profile-icon {
    width: 75%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    font-size: 16px;
    font-weight: bold;
    text-decoration: none;
    color: var(--text-color);
    border: 2px solid var(--button-border-color);
    border-radius: 8px;
    background: var(--background-color-white);
    transition: all 0.3s ease-in-out;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-menu .profile-icon:hover {
    background: var(--button-hover-color);
    color: var(--button-hover-color-white);
}

.mobile-menu .profile-icon i {
    color: var(--button-hover-color);
    font-size: 22px;
    margin-right: 10px;
}

/* Затемняющий фон при открытии меню */
.mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    z-index: 999;
}

/* Медиа-запросы */
@media (max-width: 768px) {
    .desktop-menu {
        display: none;
    }

    .burger-icon {
        display: block;
    }
}

/* Плавные переходы */
header,
nav,
.logo h1,
.desktop-menu li,
.mobile-menu,
.mobile-menu .nav-button,
.mobile-menu li i,
.profile-icon {
    transition: background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease;
}
</style>