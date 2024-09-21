<template>
    <header>
        <nav>
            <div class="logo">
                <h1>TRENING TERRITORY</h1>
            </div>
            <div class="navbar">
                <ul>
                    <li><a href="#" class="nav-button">РАСПИСАНИЕ</a></li>
                    <li><a href="#" class="nav-button">ПИТАНИЕ</a></li>
                    <li><a href="#" class="nav-button">ПРОГРЕСС</a></li>
                    <li><a href="#" class="profile-icon"><i class="fa-solid fa-user"></i></a></li>
                </ul>
            </div>
        </nav>
    </header>
</template>

<script>
export default {
    name: 'HeaderLast',
    methods: {
        openLoginModal() {
            this.$emit('open-login-modal');
        },
        openRegisterModal() {
            this.$emit('open-register-modal');
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

.navbar ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
}

.navbar ul li {
    margin-left: 20px;
    font-size: 18px;
}

.navbar ul li:first-child {
    margin-left: 0;
}

.navbar ul li a.nav-button {
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

.navbar ul li a.nav-button:hover {
    background-color: #DD7548;
    color: white;
}

.navbar ul li a.profile-icon {
    border: 2px solid #DD7548;
    border-radius: 50%;
    padding: 5px;
    color: white;
    display: inline-block;
    text-align: center;
    transition: background-color 0.3s ease;
    width: 40px;
}

.navbar ul li a.profile-icon:hover {
    background-color: #DD7548;
    color: white;
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

    .navbar ul li a.nav-button {
        justify-content: center;
    }

    .navbar p {
        display: none;
    }
}
</style>
