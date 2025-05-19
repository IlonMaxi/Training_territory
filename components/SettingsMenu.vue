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
                <input type="email" v-model="user.email" placeholder="primer@mail.com" />
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

        <!-- Дополнительные поля только для тренеров -->
        <div v-if="isCoach" class="form-group">
            <label>Специализация</label>
            <div class="input-box">
                <input type="text" v-model="user.specialization" placeholder="Фитнес, пилатес и т.д." />
                <i class="fa-solid fa-pen"></i>
            </div>
        </div>

        <div v-if="isCoach" class="form-group">
            <label>Опыт</label>
            <div class="input-box">
                <input type="text" v-model="user.experience" placeholder="5 лет, 10 лет и т.д." />
                <i class="fa-solid fa-pen"></i>
            </div>
        </div>

        <div class="form-group">
            <label>Фото</label>
            <div class="input-box">
                <input type="file" @change="handleImageUpload" />
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
                id: null,
                role: "",
                firstName: "",
                lastName: "",
                middleName: "",
                email: "",
                phone: "",
                login: "",
                image: "",
                specialization: "",
                experience: ""
            },
            selectedImage: null
        };
    },
    mounted() {
        this.loadUserFromCookies();
    },
    computed: {
        isCoach() {
            return this.user.role === 'coach';
        }
    },
    methods: {
        loadUserFromCookies() {
            const cookies = document.cookie.split("; ").reduce((acc, c) => {
                const [key, val] = c.split("=");
                acc[key] = decodeURIComponent(val);
                return acc;
            }, {});

            if (!cookies.user) {
                console.error("Кука 'user' не найдена");
                return;
            }

            try {
                const userData = JSON.parse(cookies.user);
                const role = cookies.accountType === "trainer" ? "coach" : "client";

                this.user = {
                    id: userData.clientid || userData.coachid,
                    role,
                    firstName: userData.first_name || "",
                    lastName: userData.last_name || "",
                    middleName: userData.patronymic || "",
                    email: userData.email || "",
                    phone: userData.phone_number || "",
                    login: userData.username || "",
                    image: userData.image || "",
                    specialization: userData.specialization || "",
                    experience: userData.experience || ""
                };
            } catch (e) {
                console.error("Ошибка парсинга куки user:", e);
            }
        },
        handleImageUpload(event) {
            this.selectedImage = event.target.files[0];
        },
        async updateUser() {
            if (!this.user.id) return;

            const formData = new FormData();
            formData.append("first_name", this.user.firstName);
            formData.append("last_name", this.user.lastName);
            formData.append("patronymic", this.user.middleName);
            formData.append("username", this.user.login);
            formData.append("phone_number", this.user.phone);
            formData.append("email", this.user.email);

            if (this.isCoach) {
                formData.append("specialization", this.user.specialization);
                formData.append("experience", this.user.experience);
            }

            formData.append("image", this.selectedImage || this.user.image);

            const endpoint = this.isCoach
                ? `http://26.100.29.243:3000/api/coaches/${this.user.id}`
                : `http://26.100.29.243:3000/api/clients/${this.user.id}`;

            try {
                const res = await fetch(endpoint, { method: "PUT", body: formData });
                const result = await res.json();
                if (res.ok) {
                    alert("Данные успешно обновлены!");
                } else {
                    console.error("Ошибка:", result.error);
                }
            } catch (error) {
                console.error("Ошибка запроса:", error);
            }
        }
    }
};
</script>

<style scoped>
.settings-container {
    background: var(--background-color-white);
    padding: 20px;
    border-radius: 12px;
    max-width: 600px;
    margin: auto;
    color: var(--text-color);
    transition: background-color 0.5s, color 0.5s;
}

h2 {
    font-size: 22px;
    font-weight: bold;
    color: var(--text-color);
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
    border-bottom: 2px solid var(--button-hover-color);
    padding-bottom: 10px;
}

label {
    font-size: 14px;
    font-weight: bold;
    color: var(--text-color);
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
    background-color: var(--background-color);
    color: var(--text-color);
    transition: background-color 0.5s, color 0.5s, border-color 0.3s;
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
    background: var(--button-hover-color-white);
    border: 2px solid var(--button-hover-color);
    color: var(--text-color);
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}

.save-btn:hover {
    background: var(--button-hover-color);
    color: var(--button-hover-color-white);
}
</style>