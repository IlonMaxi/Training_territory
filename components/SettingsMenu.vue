<template>
    <div class="settings-container">
        <h2>НАСТРОЙКИ</h2>
        <p class="subtitle">персональная информация</p>
        <p class="description">Обновите фотографию и персональные данные здесь</p>

        <div class="form-group">
            <label>Имя Фамилия Отчество</label>
            <div class="input-row">
                <div class="input-box">
                    <input type="text" v-model="user.firstName" placeholder="Имя" />
                    <i class="fa-solid fa-pen"></i>
                </div>
                <div class="input-box">
                    <input type="text" v-model="user.lastName" placeholder="Фамилия" />
                    <i class="fa-solid fa-pen"></i>
                </div>
                <div class="input-box">
                    <input type="text" v-model="user.middleName" placeholder="Отчество" />
                    <i class="fa-solid fa-pen"></i>
                </div>
            </div>
        </div>

        <div class="form-group">
            <label>Email</label>
            <div class="input-box">
                <input type="email" v-model="user.email" placeholder="primer.com" />
                <i class="fa-solid fa-pen"></i>
            </div>
        </div>

        <div class="form-group">
            <label>Номер телефона</label>
            <div class="input-box">
                <input type="tel" v-model="user.phone" placeholder="+7-900-900-90-90" />
                <i class="fa-solid fa-pen"></i>
            </div>
        </div>

        <div class="form-group">
            <label>Логин</label>
            <div class="input-box">
                <input type="text" v-model="user.login" placeholder="Логин" />
                <i class="fa-solid fa-info-circle"></i>
                <i class="fa-solid fa-pen"></i>
            </div>
        </div>

        <button class="save-btn" @click="updateUser">СОХРАНИТЬ</button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            user: {
                id: null, // ID пользователя
                firstName: "",
                lastName: "",
                middleName: "",
                email: "",
                phone: "",
                login: "",
            }
        };
    },
    mounted() {
        this.loadUserFromCookies();
    },
    methods: {
        // Загружаем пользователя из куков
        loadUserFromCookies() {
            const cookies = document.cookie.split("; ");
            const userCookie = cookies.find(row => row.startsWith("user="));

            if (userCookie) {
                try {
                    const userData = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
                    console.log("Загруженные данные из куков:", userData); // Лог для проверки

                    if (!userData.clientid) {
                        console.error("Ошибка: clientid отсутствует в куках!");
                    } else {
                        this.user = {
                            id: userData.clientid, // Используем clientid как ID
                            firstName: userData.first_name || "",
                            lastName: userData.last_name || "",
                            middleName: userData.patronymic || "",
                            email: userData.email || "",
                            phone: userData.phone_number || "",
                            login: userData.username || ""
                        };
                    }
                } catch (error) {
                    console.error("Ошибка парсинга куков:", error);
                }
            } else {
                console.error("Ошибка: кука 'user' не найдена!");
            }
        },

        // Отправка данных на сервер
        async updateUser() {
            if (!this.user.id) { // Исправлено: теперь проверяем правильный ID
                console.error("Ошибка: ID клиента отсутствует!");
                return;
            }

            try {
                const response = await fetch(`http://26.100.29.243:3000/api/clients/${this.user.id}`, { // Исправлено: this.user.clientid → this.user.id
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        first_name: this.user.firstName,
                        last_name: this.user.lastName,
                        patronymic: this.user.middleName,
                        username: this.user.login,
                        phone_number: this.user.phone,
                        email: this.user.email
                    })
                });

                const responseText = await response.text(); // Логируем текст ответа
                console.log("Ответ сервера:", responseText);

                const data = JSON.parse(responseText);

                if (response.ok) {
                    console.log("Успешное обновление:", data);
                    alert("Данные успешно обновлены!");
                } else {
                    console.error("Ошибка обновления данных:", data.error);
                }
            } catch (error) {
                console.error("Ошибка при отправке запроса:", error);
            }
        }
    }
};
</script>


<style scoped>
.settings-container {
    background: #fff;
    padding: 20px;
    border-radius: 12px;
    max-width: 600px;
    margin: auto;
    color: black;
}

h2 {
    font-size: 22px;
    font-weight: bold;
}

.subtitle {
    font-size: 14px;
    color: gray;
}

.description {
    font-size: 12px;
    color: gray;
}

.form-group {
    margin-top: 20px;
    border-bottom: 2px solid #e26a41;
    padding-bottom: 10px;
}

label {
    font-size: 14px;
    font-weight: bold;
}

.input-row {
    display: flex;
    gap: 10px;
}

.input-box {
    position: relative;
    flex: 1;
}

.input-box input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
}

.input-box i {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: gray;
    cursor: pointer;
}

.fa-info-circle {
    margin-right: 20px;
}

.save-btn {
    margin-top: 20px;
    background: white;
    border: 2px solid #e26a41;
    color: black;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
}
</style>
