<template>
    <div class="settings-container">
        <h2>НАСТРОЙКИ</h2>
        <p class="subtitle">персональная информация</p>
        <p class="description">Обновите фотографию и персональные данные здесь</p>

        <!-- ФИО -->
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

        <!-- Email -->
        <div class="form-group">
            <label>Email</label>
            <div class="input-box">
                <input type="email" v-model="user.email" placeholder="primer@mail.com" />
                <i class="fa-solid fa-pen"></i>
            </div>
        </div>

        <!-- Телефон -->
        <div class="form-group">
            <label>Номер телефона</label>
            <div class="input-box">
                <input type="tel" v-model="user.phone" placeholder="+7-900-900-90-90" />
                <i class="fa-solid fa-pen"></i>
            </div>
        </div>

        <!-- Логин -->
        <div class="form-group">
            <label>Логин</label>
            <div class="input-box">
                <input type="text" v-model="user.login" placeholder="Логин" />
                <i class="fa-solid fa-info-circle"></i>
                <i class="fa-solid fa-pen"></i>
            </div>
        </div>

        <!-- Только для тренера -->
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

        <!-- Пол -->
        <div class="form-group">
            <label>Пол</label>
            <div class="input-box">
                <select v-model="user.gender">
                    <option disabled value="">Выберите пол</option>
                    <option value="male">Мужчина</option>
                    <option value="female">Женщина</option>
                </select>
                <i class="fa-solid fa-pen"></i>
            </div>
        </div>

        <!-- Фото -->
        <div class="form-group">
            <label>Фото</label>
            <div class="input-box">
                <input type="file" @change="handleImageUpload" />
                <i class="fa-solid fa-pen"></i>
            </div>
        </div>

        <button class="save-btn" @click="updateUser">СОХРАНИТЬ</button>

        <!-- Профиль здоровья: помощник учитывает это при подборе тренировок и питания -->
        <div v-if="!isCoach" class="health-block">
            <h3>Здоровье</h3>
            <p class="health-hint">
                Травмы убирают опасные упражнения из рекомендаций,
                аллергии — блюда с этим продуктом из плана питания.
            </p>

            <div class="health-add">
                <select v-model="newLimitation.kind">
                    <option value="injury">Травма</option>
                    <option value="allergy">Аллергия</option>
                </select>
                <input type="text" v-model="newLimitation.value"
                    :placeholder="newLimitation.kind === 'injury' ? 'колено, поясница, плечо…' : 'орехи, молоко, рыба…'"
                    @keyup.enter="addLimitation" />
                <button class="health-btn" @click="addLimitation" :disabled="!newLimitation.value.trim()">
                    Добавить
                </button>
            </div>

            <p v-if="limitationError" class="health-error">{{ limitationError }}</p>

            <ul class="health-list">
                <li v-for="item in limitations" :key="item.limitationid">
                    <span class="health-tag" :class="item.kind">
                        {{ item.kind === 'injury' ? 'травма' : 'аллергия' }}
                    </span>
                    <span class="health-value">{{ item.value }}</span>
                    <button class="health-remove" @click="removeLimitation(item.limitationid)"
                        aria-label="Убрать">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </li>
                <li v-if="!limitations.length" class="health-empty">Ограничений не указано</li>
            </ul>
        </div>
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
                experience: "",
                gender: ""
            },
            selectedImage: null,
            limitations: [],
            newLimitation: { kind: 'injury', value: '' },
            limitationError: null
        };
    },
    computed: {
        isCoach() {
            return this.user.role === "coach";
        }
    },
    mounted() {
        this.loadUserFromCookies();
        if (!this.isCoach) this.loadLimitations();
    },
    methods: {
        async loadLimitations() {
            if (!this.user.id) return;
            try {
                const res = await fetch(`/api/clients/${this.user.id}/limitations`);
                if (!res.ok) return;
                const data = await res.json();
                this.limitations = Array.isArray(data) ? data : [];
            } catch (err) {
                console.error('Не удалось загрузить ограничения:', err);
            }
        },

        async addLimitation() {
            const value = this.newLimitation.value.trim();
            if (!value) return;
            this.limitationError = null;

            try {
                const res = await fetch(`/api/clients/${this.user.id}/limitations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ kind: this.newLimitation.kind, value })
                });
                const data = await res.json();

                if (!res.ok) {
                    this.limitationError = data.error || 'Не удалось сохранить';
                    return;
                }

                this.limitations.push(data);
                this.newLimitation.value = '';
            } catch (err) {
                console.error('Не удалось добавить ограничение:', err);
                this.limitationError = 'Нет связи с сервером';
            }
        },

        async removeLimitation(id) {
            try {
                const res = await fetch(`/api/clients/${this.user.id}/limitations/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    this.limitations = this.limitations.filter(item => item.limitationid !== id);
                }
            } catch (err) {
                console.error('Не удалось удалить ограничение:', err);
            }
        },

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
                    gender: (userData.gender || "").toLowerCase(),
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
            formData.append("gender", this.user.gender);

            if (this.isCoach) {
                formData.append("specialization", this.user.specialization);
                formData.append("experience", this.user.experience);
            }

            formData.append("image", this.selectedImage || this.user.image);

            const endpoint = this.isCoach
                ? `/api/coaches/${this.user.id}`
                : `/api/clients/${this.user.id}`;

            try {
                const res = await fetch(endpoint, {
                    method: "PUT",
                    body: formData
                });

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
    font-size: var(--text-h5);
    font-weight: bold;
    color: var(--text-color);
}

.subtitle {
    font-size: var(--text-h8);
    color: gray;
}

.description {
    font-size: var(--text-caption);
    color: gray;
}

.form-group {
    margin-top: 20px;
    border-bottom: 2px solid var(--button-hover-color);
    padding-bottom: 10px;
}

label {
    font-size: var(--text-h8);
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
    font-size: var(--text-h8);
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

.input-box select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: var(--text-h8);
    background-color: var(--background-color);
    color: var(--text-color);
    transition: background-color 0.5s, color 0.5s, border-color 0.3s;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
}

.input-box select:focus {
    outline: none;
    border-color: var(--button-hover-color);
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

.health-block {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid var(--button-border-color);
}

.health-block h3 {
    margin: 0 0 6px;
    color: var(--text-color);
}

.health-hint {
    margin: 0 0 14px;
    font-size: var(--text-h8);
    color: var(--text-color);
    opacity: 0.75;
}

.health-add {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
}

.health-add select,
.health-add input {
    padding: 10px 12px;
    font-size: var(--text-h8);
    color: var(--text-color);
    background-color: var(--background-color);
    border: 1px solid var(--button-border-color);
    border-radius: 10px;
}

.health-add input {
    flex: 1 1 220px;
    min-width: 0;
}

.health-btn {
    padding: 10px 18px;
    border: none;
    border-radius: 10px;
    background-color: var(--button-hover-color);
    color: var(--button-hover-color-white);
    cursor: pointer;
}

.health-btn:disabled {
    opacity: 0.5;
    cursor: default;
}

.health-error {
    margin: 0 0 10px;
    font-size: var(--text-caption);
    color: var(--button-hover-color);
}

.health-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.health-list li {
    display: flex;
    align-items: center;
    gap: 10px;
}

.health-tag {
    padding: 3px 10px;
    border-radius: 999px;
    font-size: var(--text-caption);
    border: 1px solid var(--button-border-color);
    color: var(--text-color);
}

.health-tag.injury {
    background-color: var(--button-border-color);
    color: var(--button-hover-color-white);
}

.health-value {
    flex: 1 1 auto;
    color: var(--text-color);
}

.health-remove {
    background: transparent;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    padding: 4px 8px;
}

.health-empty {
    font-size: var(--text-h8);
    color: var(--text-color);
    opacity: 0.6;
}
</style>

