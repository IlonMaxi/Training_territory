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
                    <li>
                        <router-link to="/profile" class="profile-icon">
                            <i class="fa-solid fa-user"></i>
                        </router-link>
                    </li>
                </ul>
                <div class="burger-icon" @click="toggleMobileMenu" role="button" aria-label="Открыть мобильное меню"
                    tabindex="0">
                    <i class="fa-solid fa-bars"></i>
                </div>
                <div class="mobile-menu-overlay" v-if="isMobileMenuOpen" @click="closeMobileMenu"></div>
                <ul class="mobile-menu" :class="{ 'active': isMobileMenuOpen }">
                    <li style="display: flex; align-items: center;">
                        <i class="fa-solid fa-user"></i>
                        <router-link to="/profile" class="profile-icon" @click="closeMobileMenu">
                            ПРОФИЛЬ
                        </router-link>
                    </li>
                    <li><a href="#" class="nav-button" @click="navigateToSection('schedule')">РАСПИСАНИЕ</a></li>
                    <li><a href="#" class="nav-button" @click="navigateToSection('nutrition')">ПИТАНИЕ</a></li>
                    <li><a href="#" class="nav-button" @click="navigateToSection('progress')">ПРОГРЕСС</a></li>
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
            isMobileMenuOpen: false
        };
    },
    methods: {
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
                console.warn('Неизвестный тип аккаунта. Возможно, пользователь не вошел в систему.');
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
        }
    }
}
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
    background-color: #272827;
    padding: 10px;
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
    color: white;
    background-color: transparent;
    padding: 10px 20px;
    border: 2px solid #DD7548;
    border-radius: 20px;
    transition: all 0.3s ease;
    display: inline-block;
    text-align: center;
}

.nav-button:hover {
    background-color: #DD7548;
    color: white;
}

/* Иконка профиля */
.profile-icon {
    border: 2px solid #DD7548;
    border-radius: 50%;
    padding: 5px;
    color: white;
    display: inline-block;
    text-align: center;
    transition: background-color 0.3s ease;
    width: 40px;
}

.profile-icon:hover {
    background-color: #DD7548;
    color: white;
}

/* Иконка бургера */
.burger-icon {
    display: none;
    color: white;
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
    background: white;
    border-radius: 15px 0 0 15px;
    padding: 15px;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
    transition: right 0.3s ease-in-out;
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
    color: black;
    border: 2px solid #c85a2e;
    border-radius: 8px;
    background: white;
    transition: all 0.3s ease-in-out;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-menu li {
    width: 100%;
}

.mobile-menu li i {
    margin-right: 20px;
    color: #c85a2e;
    font-size: 22px;
    border: 2px solid #c85a2e;
    border-radius: 50%;
    width: 51px;
    height: 51px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.mobile-menu a:hover {
    background: #c85a2e;
    color: white;
}

/* Иконка профиля */
.mobile-menu .profile-icon {
    width: 75%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    font-size: 16px;
    font-weight: bold;
    text-decoration: none;
    color: black;
    border: 2px solid #c85a2e;
    border-radius: 8px;
    background: white;
    transition: all 0.3s ease-in-out;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-menu .profile-icon a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid #c85a2e;
    background: white;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-menu .profile-icon i {
    color: #c85a2e;
    font-size: 22px;
    margin-right: 10px;
}

.mobile-menu .profile-icon:hover {
    background: #c85a2e;
}

.mobile-menu .profile-icon:hover i {
    color: white;
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
</style>
